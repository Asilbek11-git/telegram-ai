"""
Telegram Business update'larini qayta ishlovchi router (aiogram 3.x).
- 30 ta xabar konteksti va chat xotirasi (chat_notes).
- JSON javobni qabul qilish va notify_owner holatida egasiga xabar berish.
- Uzun javobni 2 qismga bo'lib, orasida 1-2 soniya typing bilan yuborish.
- Gemini 3 marta xato bersa: foydalanuvchiga javob bermasdan, egasiga xabar yuborish.
"""

import io
import re
import asyncio
import logging
from typing import List, Dict, Any, Optional

from aiogram import Router, Bot
from aiogram.types import (
    BusinessConnection,
    Message,
    ContentType,
)

from config import config
from database import Database
from gemini_service import GeminiService
from debounce_manager import DebounceManager

logger = logging.getLogger(__name__)

router = Router(name="business_router")
db = Database(config.DATABASE_PATH)
gemini = GeminiService()
debouncer = DebounceManager(delay_seconds=config.DEBOUNCE_DELAY_SECONDS)


@router.business_connection()
async def handle_business_connection(connection: BusinessConnection):
    """Foydalanuvchi botni o'zining Telegram Business profiliga ulab yoki o'chirganda chaqiriladi."""
    logger.info(
        f"Business connection yangilandi: ID={connection.id}, "
        f"User={connection.user.id} ({connection.user.full_name}), "
        f"CanReply={connection.can_reply}, IsEnabled={connection.is_enabled}"
    )
    await db.save_business_connection(
        connection_id=connection.id,
        user_id=connection.user.id,
        can_reply=connection.can_reply,
        is_enabled=connection.is_enabled
    )


@router.business_message()
async def handle_business_message(message: Message, bot: Bot):
    """Telegram Premium Chat Automation orqali kelgan barcha shaxsiy xabarlar."""
    chat_id = message.chat.id
    sender = message.from_user
    business_conn_id = message.business_connection_id

    if not sender or not business_conn_id:
        return

    sender_id = sender.id

    # 1. Bot global ravishda yoqilganmi?
    if not await db.is_bot_active():
        logger.info(f"Bot o'chirilgan (/off). Chat: {chat_id}")
        return

    # 2. EGASI O'ZI YOZDIMI? (Human Takeover - 30 daqiqa jim turish)
    if sender_id == config.OWNER_ID:
        logger.info(f"Egasi ({config.OWNER_NAME}) chatga {chat_id} o'zi yozdi. Bot {config.OWNER_TAKEOVER_PAUSE_MINUTES} daqiqaga to'xtatildi.")
        await db.set_chat_pause(
            chat_id=chat_id,
            duration_minutes=config.OWNER_TAKEOVER_PAUSE_MINUTES,
            reason="owner_takeover"
        )
        text_content = message.text or message.caption or "[Media xabar]"
        await db.save_message(chat_id, sender_id, role="model", content=text_content)
        return

    # 3. YAQINLAR VA OILA A'ZOLARI TEKSHIRUVI
    if sender_id in config.excluded_ids_set:
        logger.info(f"Foydalanuvchi {sender_id} istisno qilingan. Bot javob bermaydi.")
        return

    # 4. CHATNING PAUZA HOLATINI TEKSHIRISH
    is_paused, remaining = await db.is_chat_paused(chat_id)
    if is_paused:
        logger.info(f"Chat {chat_id} pauzada ({remaining} daqiqa qoldi).")
        user_msg = message.text or message.caption or "[Media]"
        await db.save_message(chat_id, sender_id, role="user", content=user_msg)
        return

    # 5. XABAR TURINI TEKSHIRISH (Matn, Rasm, Ovozli, Stiker)
    text_content = ""
    image_bytes = None

    if message.content_type == ContentType.TEXT:
        text_content = message.text or ""
    elif message.content_type == ContentType.PHOTO:
        text_content = message.caption or ""
        try:
            photo = message.photo[-1]
            file = await bot.get_file(photo.file_id)
            if file.file_path:
                in_memory = io.BytesIO()
                await bot.download_file(file.file_path, in_memory)
                image_bytes = in_memory.getvalue()
        except Exception as e:
            logger.error(f"Rasmni yuklab olishda xatolik: {e}")
    elif message.content_type in [ContentType.VOICE, ContentType.AUDIO]:
        await _send_single_message(
            bot=bot,
            chat_id=chat_id,
            business_conn_id=business_conn_id,
            text=f"Hozir ovozli xabarni eshita olmayapman, iloji bo'lsa qisqacha matn qilib yozib yubora olasizmi? Darhol javob beraman 👍",
            typing_delay=2.5
        )
        await db.save_message(chat_id, sender_id, role="user", content="[Ovozli xabar]")
        return
    elif message.content_type == ContentType.STICKER:
        await _send_single_message(
            bot=bot,
            chat_id=chat_id,
            business_conn_id=business_conn_id,
            text="Qanday yordam bera olaman? Fikringizni bemalol yozsangiz bo'ladi 🙂",
            typing_delay=2.0
        )
        return
    else:
        text_content = message.caption or "[Hujjat/Fayl]"

    # 6. DEBOUNCER: Ketma-ket kelgan xabarlarni birlashtirish (3.5 soniya)
    msg_data = {
        "text": text_content,
        "image_bytes": image_bytes,
        "sender_id": sender_id,
        "sender_name": sender.full_name,
        "sender_username": sender.username,
        "business_conn_id": business_conn_id
    }

    await debouncer.add_message(
        chat_id=chat_id,
        message_data=msg_data,
        callback=lambda c_id, msgs: _process_accumulated_messages(bot, c_id, msgs)
    )


async def _process_accumulated_messages(bot: Bot, chat_id: int, messages: List[Dict[str, Any]]):
    """Birlashtirilgan xabarlarni Gemini ga yuborish va javob qaytarish."""
    if not messages:
        return

    first_msg = messages[0]
    business_conn_id = first_msg["business_conn_id"]
    sender_id = first_msg["sender_id"]
    sender_name = first_msg["sender_name"]
    sender_username = first_msg["sender_username"]

    text_chunks = [m["text"] for m in messages if m.get("text")]
    combined_text = "\n".join(text_chunks) if text_chunks else ""

    image_bytes = None
    for m in reversed(messages):
        if m.get("image_bytes"):
            image_bytes = m["image_bytes"]
            break

    # Foydalanuvchi xabarini saqlash
    await db.save_message(chat_id, sender_id, role="user", content=combined_text or "[Rasm]")

    # Chat xotirasi (oldingi eslatma va ism)
    chat_notes = await db.get_chat_notes(chat_id)
    if not chat_notes:
        chat_notes = {"user_name": sender_name, "topics_summary": ""}

    # Oxirgi 30 ta xabar tarixi
    history = await db.get_recent_history(chat_id, limit=30)

    # Gemini API chaqiruvi (3 marta qayta urinish bilan)
    reply_text, notify_owner, reason, updated_summary = await gemini.generate_response(
        current_text=combined_text,
        history=history[:-1] if history else [],
        chat_notes=chat_notes,
        image_bytes=image_bytes
    )

    # Chat xotirasini yangilash (agar yangi mavzu xulosasi bo'lsa)
    if updated_summary:
        current_topics = chat_notes.get("topics_summary", "")
        new_topics = f"{current_topics}; {updated_summary}".strip("; ") if current_topics else updated_summary
        await db.update_chat_notes(chat_id, sender_name, new_topics)

    # AGAR GEMINI 3 MARTA URINISHDA HAM XATO BERGAN BO'LSA
    if reply_text is None:
        logger.error(f"Chat {chat_id}: Gemini javob bera olmadi. Foydalanuvchiga hech narsa yuborilmadi, egasiga xabar qilindi.")
        await _notify_owner(
            bot=bot,
            sender_name=sender_name,
            sender_username=sender_username,
            sender_id=sender_id,
            user_text=combined_text,
            bot_reply="(Xatolik sababli hech qanday javob yuborilmadi)",
            reason=f"Gemini API 3 marta urinishda ham ishlamadi: {reason}"
        )
        return

    # Insondek yuborish: agar uzun bo'lsa, 2 ta xabarga bo'lib, orasida 1-2 soniya typing ko'rsatish
    await _send_human_like_split_reply(
        bot=bot,
        chat_id=chat_id,
        business_conn_id=business_conn_id,
        reply_text=reply_text
    )

    # Bot javobini bazada saqlash
    await db.save_message(chat_id, config.OWNER_ID, role="model", content=reply_text)

    # Egasiga bildirishnoma yuborish kerakmi?
    if notify_owner:
        await _notify_owner(
            bot=bot,
            sender_name=sender_name,
            sender_username=sender_username,
            sender_id=sender_id,
            user_text=combined_text,
            bot_reply=reply_text,
            reason=reason or "Muhim masala yoki egasining shaxsiy aralashuvi talab etiladi"
        )


def _split_reply_if_long(text: str) -> List[str]:
    """
    Agar matn uzun bo'lsa (> 110 belgi va 2+ jumla), uni 2 ta tabiiy bo'lakka ajratadi.
    Aks holda bitta bo'lak qilib qaytaradi.
    """
    clean_text = text.strip()
    if len(clean_text) < 110:
        return [clean_text]

    # Gap tugash nuqtalari bo'yicha bo'lish (. ! ? yoki yangi qator)
    sentences = re.split(r'(?<=[.!?\n])\s+', clean_text)
    if len(sentences) <= 1:
        return [clean_text]

    # Ikki qismga tengroq taqsimlash
    mid = len(sentences) // 2
    part1 = " ".join(sentences[:mid]).strip()
    part2 = " ".join(sentences[mid:]).strip()

    if part1 and part2:
        return [part1, part2]

    return [clean_text]


async def _send_human_like_split_reply(bot: Bot, chat_id: int, business_conn_id: str, reply_text: str):
    """
    Xabarni insondek kechikish bilan yuborish.
    Uzun bo'lsa 2 ga bo'lib, o'rtasida 1-2 soniya 'typing...' ko'rsatish.
    """
    parts = _split_reply_if_long(reply_text)

    for i, part in enumerate(parts):
        # Birinchi qism uchun odamdek hisoblangan kechikish (2-8 soniya)
        if i == 0:
            calc_delay = config.MIN_TYPING_DELAY + (len(part) * 0.035)
            delay = min(config.MAX_TYPING_DELAY, max(config.MIN_TYPING_DELAY, calc_delay))
        else:
            # Ikkinchi qism uchun qisqa tabiiy pauza (1-2 soniya)
            delay = 1.6

        await _send_single_message(
            bot=bot,
            chat_id=chat_id,
            business_conn_id=business_conn_id,
            text=part,
            typing_delay=delay
        )


async def _send_single_message(bot: Bot, chat_id: int, business_conn_id: str, text: str, typing_delay: float):
    """Bitta xabarni 'typing...' statusi bilan yuborish."""
    try:
        await bot.send_chat_action(
            chat_id=chat_id,
            action="typing",
            business_connection_id=business_conn_id
        )

        await asyncio.sleep(typing_delay)

        await bot.send_message(
            chat_id=chat_id,
            text=text,
            business_connection_id=business_conn_id
        )
    except Exception as e:
        logger.error(f"Xabar yuborishda xatolik (Chat {chat_id}): {e}", exc_info=True)


async def _notify_owner(bot: Bot, sender_name: str, sender_username: str, sender_id: int, user_text: str, bot_reply: str, reason: str):
    """Egasining shaxsiy Telegram bot chatiga xulosa va ogohlantirish yuborish."""
    try:
        username_str = f"@{sender_username}" if sender_username else "Username yo'q"
        alert_msg = (
            f"🚨 <b>DIQQAT: Chatdan Muhim Xulosa!</b>\n\n"
            f"👤 <b>Kimdan:</b> {sender_name} ({username_str}) [ID: <code>{sender_id}</code>]\n"
            f"⚠️ <b>Sabab:</b> {reason}\n\n"
            f"💬 <b>Foydalanuvchi yozdi:</b>\n<i>\"{user_text[:350]}\"</i>\n\n"
            f"🤖 <b>Bot javobi:</b>\n<i>\"{bot_reply[:250]}\"</i>\n\n"
            f"💡 <i>Chatga o'zingiz yozsangiz, bot 30 min jim turadi yoki <code>/pause {sender_id}</code> buyrug'ini bering.</i>"
        )
        await bot.send_message(chat_id=config.OWNER_ID, text=alert_msg, parse_mode="HTML")
    except Exception as e:
        logger.error(f"Egasiga ogohlantirish yuborishda xatolik: {e}")
