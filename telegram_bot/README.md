# 🤖 Telegram Business AI Bot (Gemini & aiogram 3.x)

Telegram Premium "Chat Automation" funksiyasi orqali shaxsiy profilingiz nomidan mijozlar va suhbatdoshlarga insondek samimiy, professional va xavfsiz javob beruvchi avtomatlashtirilgan AI yordamchi.

---

## 🌟 Asosiy Imkoniyatlar

1. **Telegram Business Connection**:
   - Bot sizning nomingizdan (`business_connection_id` orqali) xabar yozadi.
   - Suhbatdosh oddiy foydalanuvchi bilan yozishayotgandek tuyuladi.
2. **Insoniy xulq-atvor (Human Simulation)**:
   - "Typing..." (yozmoqda...) statusi bilan xabar uzunligiga qarab 2-8 soniya kechikish.
   - Ketma-ket kelgan 2-4 ta xabarni 3-4 soniya ichida bitta savolga birlashtirish (Debouncing).
3. **Egasining boshqaruvi (Human Takeover)**:
   - Agar siz o'zingiz biror chatga yozsangiz, bot darhol o'sha chatda **30 daqiqa** jim turadi.
4. **Xavfsizlik va Qoidalar**:
   - Plastik karta, bank rekvizitlari, SMS kod, parollarni berish qat'iyan taqiqlangan.
   - Moliyaviy kelishuvlar yoki narx bo'yicha yakuniy qaror qabul qilmaydi.
   - Muhim holatlar (to'lov, shikoyat, shoshilinch taklif) bo'yicha bot sizning shaxsiy chatingizga darhol bildirishnoma yuboradi.
5. **Yaqinlar va oila a'zolari filtri**:
   - Belgilangan Telegram ID larga bot hech qachon avtomatik javob bermaydi.
6. **Egasining maxsus buyruqlari**:
   - `/on` — Botni yoqish
   - `/off` — Botni butunlay to'xtatish
   - `/pause <chat_id> [daqiqa]` — Muayyan chatni vaqtincha to'xtatish
   - `/resume <chat_id>` — Chatdagi pauzani muddatidan oldin bekor qilish
   - `/stats` — Barcha xabarlar va holat statistikasi

---

## 🚀 O'rnatish va Ishga Tushirish

### 1-qadam: Telegram Business rejimini yoqish
1. Shaxsiy profilingizda **Telegram Premium** obunasi bo'lishi kerak.
2. [@BotFather](https://t.me/BotFather) ga kiring va `/newbot` orqali yangi bot oching.
3. Bot yaratilgach:
   - `/mybots` buyrug'ini yuboring.
   - O'z botingizni tanlang.
   - **Bot Settings** bo'limiga kiring.
   - **Telegram Business** tugmasini bosing va **Turn On** (Yoqish) qiling.
4. Telegram ilovangizda:
   - **Sozlamalar (Settings)** -> **Telegram Business** -> **Chatbots (Chat-botlar)** bo'limiga kiring.
   - Yaratgan botingizni qidiring va biriktiring.
   - Ruxsatlar qismida "Xabarlarga javob berish" (Reply to messages) ruxsatini yoqing.

### 2-qadam: Google Gemini API kalitini olish
1. [Google AI Studio](https://aistudio.google.com/apikey) saytiga kiring.
2. **Create API Key** tugmasini bosing va kalitni nusxalang.

### 3-qadam: Loyihani serverga o'rnatish
```bash
# Python virtual muhitini yaratish
python3 -m venv venv
source venv/bin/activate

# Kerakli kutubxonalarni o'rnatish
pip install -r requirements.txt

# .env faylini sozlash
cp .env.example .env
nano .env
```

### 4-qadam: .env faylini to'ldirish
```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxyz
OWNER_ID=123456789
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
GEMINI_MODEL=gemini-2.5-flash
OWNER_NAME=Ali Valiyev
OWNER_PROFESSION="Dasturchi"
OWNER_CITY="Toshkent"
EXCLUDED_USER_IDS=987654321,112233445
```

### 5-qadam: Ishga tushirish
```bash
python main.py
```

Yoki Docker orqali:
```bash
docker compose up -d --build
```

---

## 🛠️ Serverda (Ubuntu 22.04+) Doimiy Ishlatish (Systemd Service)

Server qayta yoqilganda ham bot avtomatik ishlab turishi uchun:

1. Fayl oching:
```bash
sudo nano /etc/systemd/system/tg_business_bot.service
```

2. Quyidagi matnni joylang (yo'llarni o'zgartiring):
```ini
[Unit]
Description=Telegram Business AI Bot Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/telegram-business-bot
ExecStart=/home/ubuntu/telegram-business-bot/venv/bin/python main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

3. Faollashtiring:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tg_business_bot
sudo systemctl start tg_business_bot
sudo systemctl status tg_business_bot
```
