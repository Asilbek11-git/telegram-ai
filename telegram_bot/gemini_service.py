"""
Gemini AI integratsiya xizmati (google-genai SDK).
Kontekst (oxirgi 30 ta xabar), JSON javob formati, 3 marta qayta urinish (retry),
Asia/Tashkent vaqt zonasi va chat xotirasi (chat_notes).
"""

import json
import logging
import asyncio
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import List, Dict, Tuple, Optional, Any
from google import genai
from google.genai import types
from config import config

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=config.GEMINI_API_KEY)
        self.model_name = config.GEMINI_MODEL

    def get_system_instruction(self, chat_notes: Optional[Dict[str, str]] = None) -> str:
        """System promptni to'ldirib, oxiriga Toshkent vaqti va chat xotirasini qo'shadi."""
        try:
            with open(config.SYSTEM_PROMPT_FILE, "r", encoding="utf-8") as f:
                template = f.read()

            base_instruction = template.format(
                OWNER_NAME=config.OWNER_NAME,
                OWNER_AGE=config.OWNER_AGE,
                OWNER_PROFESSION=config.OWNER_PROFESSION,
                OWNER_CITY=config.OWNER_CITY,
                OWNER_CONTACT=config.OWNER_CONTACT or "Telegram orqali",
                SERVICES_INFO=config.SERVICES_INFO,
                PRICING_INFO=config.PRICING_INFO,
                WORKING_HOURS=config.WORKING_HOURS,
                CURRENT_STATUS=config.CURRENT_STATUS,
            )
        except Exception as e:
            logger.error(f"System prompt yuklashda xatolik: {e}")
            base_instruction = f"Sen {config.OWNER_NAME} nomidan tabiiy, qisqa va samimiy tarzda javob berasan."

        # Asia/Tashkent vaqt zonasi bo'yicha joriy vaqt va sana
        try:
            tz = ZoneInfo("Asia/Tashkent")
            now = datetime.now(tz)
            weekdays = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"]
            weekday_name = weekdays[now.weekday()]
            time_str = now.strftime("%H:%M")
            date_str = now.strftime("%Y-%m-%d")
            time_context = f"\n\n## Hozirgi aniq vaqt va sana (Asia/Tashkent):\n- Bugun: {weekday_name}, {date_str}, soat {time_str}."
        except Exception as e:
            time_context = f"\n\n## Hozirgi vaqt: {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} (UTC)."

        # Chat xotirasi (oldingi suhbatlar mavzusi va suhbatdosh ismi)
        memory_context = ""
        if chat_notes:
            user_name = chat_notes.get("user_name", "")
            topics = chat_notes.get("topics_summary", "")
            if user_name or topics:
                memory_context = (
                    f"\n\n## Ushbu suhbatdosh bo'yicha xotira va eslatma:\n"
                    f"- Suhbatdosh ismi: {user_name or 'Noma\'lum'}\n"
                    f"- Oldin gaplashilgan asosiy mavzular: {topics or 'Hali mavzular yozilmagan'}"
                )

        # JSON formati talabi
        json_rule = (
            "\n\n## Javob berish formati (QAT'IY JSON):\n"
            "Javobingni FAQAT quyidagi JSON tuzilmasida ber:\n"
            "{\n"
            '  "reply": "Suhbatdoshga yuboriladigan qisqa, tabiiy, insoniy javob (1-3 gap)",\n'
            '  "notify_owner": true yoki false (agar to\'lov, karta, shartnoma, jiddiy shikoyat yoki egasining shaxsiy aralashuvi kerak bo\'lsa true, oddiy suhbatda false),\n'
            '  "reason": "notify_owner true bo\'lsa uning qisqa sababi, aks holda bo\'sh satr",\n'
            '  "updated_topic_summary": "Agar yangi muhim mavzu yoki kelishuv ko\'tarilgan bo\'lsa, xotiraga qo\'shish uchun 1 jumlalik xulosa, aks holda bo\'sh satr"\n'
            "}"
        )

        return base_instruction + time_context + memory_context + json_rule

    async def generate_response(
        self,
        current_text: str,
        history: List[Dict[str, str]],
        chat_notes: Optional[Dict[str, str]] = None,
        image_bytes: Optional[bytes] = None,
        image_mime: str = "image/jpeg"
    ) -> Tuple[Optional[str], bool, str, Optional[str]]:
        """
        Gemini ga 3 marta qayta urinish bilan murojaat.
        Qaytaradi: (reply_text, notify_owner, reason, updated_topic_summary)
        Agar 3 martada ham muvaffaqiyatsiz bo'lsa: (None, True, error_msg, None)
        """
        system_instruction = self.get_system_instruction(chat_notes)

        # Kontekst: oxirgi 30 ta xabar
        contents = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg["content"])]
                )
            )

        current_parts = []
        if image_bytes:
            current_parts.append(
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=image_mime
                )
            )

        if current_text:
            current_parts.append(types.Part.from_text(text=current_text))
        elif image_bytes:
            current_parts.append(types.Part.from_text(text="Foydalanuvchi rasm yubordi. Unga mos, qisqa va tabiiy javob ber."))

        contents.append(types.Content(role="user", parts=current_parts))

        # Konfiguratsiya: temperature=0.8, top_p=0.95, JSON response
        config_params = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.8,
            top_p=0.95,
            response_mime_type="application/json",
            max_output_tokens=400,
        )

        # 3 marta qayta urinish tsikli
        last_error = None
        for attempt in range(1, 4):
            try:
                response = await self.client.aio.models.generate_content(
                    model=self.model_name,
                    contents=contents,
                    config=config_params
                )

                raw_text = response.text.strip() if response.text else ""
                parsed = json.loads(raw_text)

                reply = parsed.get("reply", "").strip()
                notify_owner = bool(parsed.get("notify_owner", False))
                reason = parsed.get("reason", "").strip()
                updated_summary = parsed.get("updated_topic_summary", "").strip() or None

                return reply, notify_owner, reason, updated_summary

            except Exception as e:
                last_error = e
                logger.warning(f"Gemini chaqiruvida xatolik (urinish {attempt}/3): {e}")
                if attempt < 3:
                    await asyncio.sleep(attempt * 1.5)

        # 3 marta ham xato bo'lsa: foydalanuvchiga javob bermasdan, egasiga ogohlantirish qaytaradi
        logger.error(f"Gemini 3 marta urinishdan so'ng to'xtadi: {last_error}", exc_info=True)
        return None, True, f"Gemini API 3 marta qayta urinishda ham ishlamadi: {str(last_error)[:120]}", None
