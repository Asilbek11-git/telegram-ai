"""
Bot egasi uchun buyruqlar boshqaruvi (faqat OWNER_ID uchun).
/on, /off, /pause <chat_id> [daqiqalar], /resume <chat_id>, /stats, /help
"""

import logging
from aiogram import Router, Bot, F
from aiogram.types import Message
from aiogram.filters import Command

from config import config
from database import Database

logger = logging.getLogger(__name__)

router = Router(name="commands_router")
db = Database(config.DATABASE_PATH)


# Faqat bot egasiga ruxsat beruvchi filter
def is_owner(message: Message) -> bool:
    return message.from_user is not None and message.from_user.id == config.OWNER_ID


@router.message(Command("start"), is_owner)
@router.message(Command("help"), is_owner)
async def cmd_help(message: Message):
    is_active = await db.is_bot_active()
    status_text = "🟢 FAOL (Yoqilgan)" if is_active else "🔴 NOFAOL (O'chirilgan)"

    text = (
        f"🤖 <b>Telegram Business AI Bot Boshqaruv Paneli</b>\n\n"
        f"Hozirgi holat: <b>{status_text}</b>\n"
        f"Egasi: <b>{config.OWNER_NAME}</b>\n"
        f"Model: <code>{config.GEMINI_MODEL}</code>\n\n"
        f"<b>Mavjud buyruqlar:</b>\n"
        f"🔹 <code>/on</code> — Botning avtomatik javob berishini yoqish\n"
        f"🔹 <code>/off</code> — Botni vaqtincha to'xtatish (javob bermaydi)\n"
        f"🔹 <code>/pause &lt;chat_id&gt; [daqiqa]</code> — Biror chatni ma'lum vaqtga to'xtatish (sukut bo'yicha 30 min)\n"
        f"🔹 <code>/resume &lt;chat_id&gt;</code> — To'xtatilgan chatni qayta faollashtirish\n"
        f"🔹 <code>/stats</code> — Xabarlar va chatlar statistikasi\n"
        f"🔹 <code>/help</code> — Ushbu yo'riqnomani ko'rish\n\n"
        f"💡 <i>Eslatma: Agar siz o'zingiz shaxsiy profilingizdan biror chatga yozsangiz, bot avtomatik ravishda o'sha chatda {config.OWNER_TAKEOVER_PAUSE_MINUTES} daqiqa jim turadi.</i>"
    )
    await message.reply(text, parse_mode="HTML")


@router.message(Command("on"), is_owner)
async def cmd_on(message: Message):
    await db.set_bot_active(True)
    logger.info("Bot egasi tomonidan yoqildi.")
    await message.reply("✅ <b>Bot muvaffaqiyatli yoqildi!</b> Endi u Telegram Business orqali kelgan xabarlarga avtomatik javob beradi.", parse_mode="HTML")


@router.message(Command("off"), is_owner)
async def cmd_off(message: Message):
    await db.set_bot_active(False)
    logger.info("Bot egasi tomonidan o'chirildi.")
    await message.reply("🛑 <b>Bot o'chirildi!</b> Avtomatik javob berish butunlay to'xtatildi. Qayta yoqish uchun <code>/on</code> buyrug'ini yuboring.", parse_mode="HTML")


@router.message(Command("pause"), is_owner)
async def cmd_pause(message: Message):
    args = message.text.split()[1:]
    if not args:
        await message.reply(
            "⚠️ <b>Format:</b> <code>/pause &lt;chat_id&gt; [daqiqa]</code>\n"
            "Misol: <code>/pause 123456789 60</code> (chatni 60 daqiqaga pauza qilish)",
            parse_mode="HTML"
        )
        return

    try:
        target_chat_id = int(args[0])
        minutes = int(args[1]) if len(args) > 1 else config.OWNER_TAKEOVER_PAUSE_MINUTES
    except ValueError:
        await message.reply("❌ Chat ID va daqiqa butun son bo'lishi kerak!", parse_mode="HTML")
        return

    await db.set_chat_pause(target_chat_id, duration_minutes=minutes, reason="manual_command")
    await message.reply(
        f"⏸ <b>Chat <code>{target_chat_id}</code> {minutes} daqiqaga pauzaga qo'yildi.</b>\n"
        f"Muddatidan oldin tiklash uchun: <code>/resume {target_chat_id}</code>",
        parse_mode="HTML"
    )


@router.message(Command("resume"), is_owner)
async def cmd_resume(message: Message):
    args = message.text.split()[1:]
    if not args:
        await message.reply("⚠️ <b>Format:</b> <code>/resume &lt;chat_id&gt;</code>", parse_mode="HTML")
        return

    try:
        target_chat_id = int(args[0])
    except ValueError:
        await message.reply("❌ Chat ID butun son bo'lishi kerak!", parse_mode="HTML")
        return

    await db.resume_chat(target_chat_id)
    await message.reply(f"▶️ <b>Chat <code>{target_chat_id}</code> pauzadan chiqarildi!</b> Bot endi bu chatga yana javob beradi.", parse_mode="HTML")


@router.message(Command("stats"), is_owner)
async def cmd_stats(message: Message):
    stats = await db.get_stats()
    is_active = await db.is_bot_active()

    status_str = "🟢 Faol" if is_active else "🔴 To'xtatilgan"

    text = (
        f"📊 <b>Bot Statistikasi:</b>\n\n"
        f"• Tizim holati: <b>{status_str}</b>\n"
        f"• Jami qayta ishlangan xabarlar: <b>{stats['total_messages']}</b>\n"
        f"• Noyob muloqot chatlari: <b>{stats['unique_chats']}</b>\n"
        f"• Hozirda pauzadagi chatlar: <b>{stats['active_pauses']}</b>\n"
        f"• Faol Business ulanishlar: <b>{stats['active_connections']}</b>\n"
        f"• Tanlangan Gemini modeli: <code>{config.GEMINI_MODEL}</code>\n"
        f"• Egasi: <b>{config.OWNER_NAME}</b>\n"
    )
    await message.reply(text, parse_mode="HTML")
