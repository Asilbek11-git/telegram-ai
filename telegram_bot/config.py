"""
Konfiguratsiya moduli (pydantic-settings / python-dotenv asosida).
Barcha maxfiy kalitlar va sozlamalar .env faylidan yuklanadi.
"""

from typing import Set
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Telegram Bot sozlamalari
    BOT_TOKEN: str = Field(..., description="Telegram bot tokeni (@BotFather)")
    OWNER_ID: int = Field(..., description="Bot egasining Telegram ID raqami")

    # Gemini AI sozlamalari
    GEMINI_API_KEY: str = Field(..., description="Google Gemini API kaliti")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash", description="Gemini modeli")

    # Shaxsiyat sozlamalari
    OWNER_NAME: str = Field(default="Ali Valiyev", description="Egasi ismi")
    OWNER_AGE: str = Field(default="26 yosh", description="Yoshi")
    OWNER_PROFESSION: str = Field(default="Full-stack dasturchi", description="Kasbi")
    OWNER_CITY: str = Field(default="Toshkent", description="Yashash shahri")
    OWNER_CONTACT: str = Field(default="", description="Qo'shimcha aloqa vositasi")
    CURRENT_STATUS: str = Field(
        default="Hozirda yangi loyiha ustida ishlayapman, kechqurun bo'shayman",
        description="Hozirgi bandlik holati"
    )

    SERVICES_INFO: str = Field(
        default="Telegram botlar, CRM tizimlar, veb-saytlar va mobil ilovalar yaratish.",
        description="Xizmatlar tavsifi"
    )
    PRICING_INFO: str = Field(
        default="Loyihalar murakkabligiga qarab $300 dan boshlanadi.",
        description="Narxlar"
    )
    WORKING_HOURS: str = Field(
        default="Dushanba - Shanba, 09:00 - 19:00",
        description="Ish vaqti"
    )

    # Istisnolar (Oila va do'stlar)
    EXCLUDED_USER_IDS: str = Field(
        default="",
        description="Bot javob bermasligi kerak bo'lgan ID lar (vergul bilan)"
    )

    # Xulq-atvor parametrlari
    OWNER_TAKEOVER_PAUSE_MINUTES: int = Field(default=30, description="Egasi yozgach jim turish (daqiqa)")
    DEBOUNCE_DELAY_SECONDS: float = Field(default=3.5, description="Ketma-ket xabarlarni birlashtirish (soniya)")
    MIN_TYPING_DELAY: float = Field(default=2.0, description="Minimal typing vaqti (soniya)")
    MAX_TYPING_DELAY: float = Field(default=8.0, description="Maksimal typing vaqti (soniya)")

    # Baza va fayllar
    DATABASE_PATH: str = Field(default="business_bot.db", description="SQLite fayl nomi")
    SYSTEM_PROMPT_FILE: str = Field(default="system_prompt.txt", description="System prompt fayli")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def excluded_ids_set(self) -> Set[int]:
        if not self.EXCLUDED_USER_IDS:
            return set()
        ids = set()
        for item in self.EXCLUDED_USER_IDS.split(","):
            cleaned = item.strip()
            if cleaned.isdigit():
                ids.add(int(cleaned))
        return ids


config = Settings()
