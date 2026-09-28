"""
Telegram Business AI Bot - Asosiy ishga tushirish fayli (main.py).
aiogram 3.x va Google Gemini API (google-genai) integratsiyasi.
"""

import sys
import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config import config
from database import Database
from business_handler import router as business_router
from commands_handler import router as commands_router

# Logging sozlamalari
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("bot.log", encoding="utf-8")
    ]
)
logger = logging.getLogger(__name__)


async def main():
    logger.info("=" * 60)
    logger.info("Telegram Business AI Bot ishga tushirilmoqda...")
    logger.info(f"Egasi: {config.OWNER_NAME} (ID: {config.OWNER_ID})")
    logger.info(f"Gemini Model: {config.GEMINI_MODEL}")
    logger.info("=" * 60)

    # 1. Konfiguratsiya tekshiruvi
    if not config.BOT_TOKEN or config.BOT_TOKEN.startswith("123456"):
        logger.error("XATOLIK: .env faylida BOT_TOKEN to'g'ri o'rnatilmagan!")
        sys.exit(1)

    if not config.GEMINI_API_KEY or config.GEMINI_API_KEY.startswith("AIzaSyYour"):
        logger.error("XATOLIK: .env faylida GEMINI_API_KEY to'g'ri o'rnatilmagan!")
        sys.exit(1)

    # 2. Ma'lumotlar bazasini initsializatsiya qilish
    db = Database(config.DATABASE_PATH)
    await db.init()
    logger.info("SQLite ma'lumotlar bazasi tayyorlandi.")

    # 3. Bot va Dispatcher yaratish
    bot = Bot(
        token=config.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    dp = Dispatcher()

    # Routerlarni ro'yxatdan o'tkazish
    dp.include_router(commands_router) # Egasi buyruqlari (/on, /off, /stats...)
    dp.include_router(business_router) # Telegram Business xabarlari

    # 4. Bot ishga tushganda egasiga xabar berish
    try:
        bot_user = await bot.get_me()
        logger.info(f"Bot muvaffaqiyatli ulandi: @{bot_user.username} (ID: {bot_user.id})")
        await bot.send_message(
            chat_id=config.OWNER_ID,
            text=(
                f"🚀 <b>Telegram Business AI Bot ishga tushdi!</b>\n\n"
                f"👤 Bot: @{bot_user.username}\n"
                f"🧠 Model: <code>{config.GEMINI_MODEL}</code>\n"
                f"⚙️ Boshqarish uchun <code>/help</code> buyrug'idan foydalaning."
            )
        )
    except Exception as e:
        logger.warning(f"Egasiga dastlabki xabar yuborishda ogohlantirish: {e}")

    # 5. Pollingni faqat kerakli update turlari bilan boshlash
    # Diqqat: Telegram Business uchun 'business_connection' va 'business_message' majburiy
    allowed_updates = ["business_connection", "business_message", "message"]

    logger.info(f"Polling boshlanmoqda (Allowed updates: {allowed_updates})...")

    # Qulashdan himoyalangan polling tsikli
    retry_delay = 3
    while True:
        try:
            # Eski to'planib qolgan updatelarni tozalash (drop_pending_updates=True)
            await bot.delete_webhook(drop_pending_updates=True)
            await dp.start_polling(
                bot,
                allowed_updates=allowed_updates,
                handle_signals=True
            )
            break
        except asyncio.CancelledError:
            logger.info("Bot to'xtatildi (Cancelled).")
            break
        except Exception as e:
            logger.error(f"Pollingda kutilmagan xatolik: {e}. {retry_delay} soniyadan so'ng qayta uriniladi...", exc_info=True)
            await asyncio.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, 60)
        finally:
            await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot jarayoni to'xtatildi.")
