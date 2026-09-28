import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronRight, 
  Terminal, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  Server, 
  Copy, 
  Check 
} from 'lucide-react';

export const SetupGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: "1. Telegram Premium va @BotFather",
      icon: <Smartphone className="w-5 h-5 text-blue-400" />,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Telegram Business Chat Automation ishlashi uchun sizning shaxsiy akkauntingizda <strong>Telegram Premium</strong> faol bo'lishi shart.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <h4 className="font-semibold text-slate-100 text-sm">@BotFather qadamlari:</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                Telegramda <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono">@BotFather</a> ga kiring.
              </li>
              <li>
                <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">/newbot</code> yuboring va botingizga nom hamda username bering (masalan: <i>Ali_Business_Assistant_bot</i>).
              </li>
              <li>
                BotFather sizga bergan <strong>BOT_TOKEN</strong> ni nusxalab oling.
              </li>
              <li>
                <strong>Business Mode yoqish:</strong> BotFatherga <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">/mybots</code> yuboring &rarr; Botingizni tanlang &rarr; <strong>Bot Settings</strong> &rarr; <strong>Telegram Business</strong> &rarr; <strong>Turn On</strong> tugmasini bosing!
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "2. Shaxsiy profilingizga ulash (Chat Automation)",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Bot sizning nomingizdan mijozlarga javob bera olishi uchun Telegram ilovangiz orqali botga ruxsat berishingiz kerak:
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <h4 className="font-semibold text-slate-100 text-sm">Telegram ilovasida:</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                Telegram &rarr; <strong>Sozlamalar (Settings)</strong> bo'limiga kiring.
              </li>
              <li>
                <strong>Telegram Business</strong> bo'limini oching.
              </li>
              <li>
                <strong>Chatbots (Chat-botlar)</strong> bandiga kiring.
              </li>
              <li>
                Yaratgan botingiz username'ini qidirib toping va biriktiring.
              </li>
              <li>
                <strong>Ruxsatlar:</strong> <i>"Xabarlarga javob berish" (Reply to messages)</i> ruxsatini albatta yoqing!
              </li>
              <li>
                Qaysi chatlar uchun ishlashini belgilang: <i>"Barcha yangi chatlar" (All new chats)</i> yoki <i>"Kontaktda bo'lmaganlar" (Exclude contacts)</i>.
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "3. Google Gemini API kalitini olish",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Bot aqlli va professional javob berishi uchun zamonaviy <strong>Google Gemini API</strong> dan foydalanadi (rasmiy <code>google-genai</code> SDK):
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <h4 className="font-semibold text-slate-100 text-sm">API kalit olish:</h4>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono">Google AI Studio (aistudio.google.com)</a> saytiga kiring.
              </li>
              <li>
                Google akkauntingiz orqali kiring va <strong>Get API key</strong> / <strong>Create API key</strong> tugmasini bosing.
              </li>
              <li>
                Hosil bo'lgan kalitni nusxalang va <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">.env</code> faylidagi <code>GEMINI_API_KEY</code> qatoriga qo'ying.
              </li>
              <li>
                Model sifatida <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">gemini-2.5-flash</code> yoki <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">gemini-3.8-flash</code> dan foydalaniladi (juda tez va arzon/bepul kvotali).
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "4. VPS Serverda Ishga Tushirish (Systemd)",
      icon: <Server className="w-5 h-5 text-amber-400" />,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Bot 24/7 rejimida uzluksiz ishlab turishi uchun uni Ubuntu/Debian VPS serveriga o'rnatamiz:
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>A. Serverga o'rnatish va paketlar:</span>
              <button
                onClick={() => copyCode(
`git clone <sizning_repoyingiz>
cd telegram-business-bot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env`, 1)}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Nusxalandi' : 'Nusxa olish'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-200 overflow-x-auto">
{`git clone <sizning_repoyingiz>
cd telegram-business-bot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env`}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>B. Systemd xizmati (avtomatik qayta ishga tushish uchun):</span>
              <button
                onClick={() => copyCode(
`sudo tee /etc/systemd/system/tg_business_bot.service > /dev/null <<EOF
[Unit]
Description=Telegram Business AI Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/telegram-business-bot
ExecStart=/root/telegram-business-bot/venv/bin/python main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable tg_business_bot
sudo systemctl start tg_business_bot
sudo systemctl status tg_business_bot`, 2)}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? 'Nusxalandi' : 'Nusxa olish'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-200 overflow-x-auto">
{`sudo systemctl daemon-reload
sudo systemctl enable tg_business_bot
sudo systemctl start tg_business_bot
sudo systemctl status tg_business_bot`}
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "5. Egasi Buyruqlari va Boshqaruv",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Bot egasi (shaxsiy chatingizda) bot bilan muloqot qilganda quyidagi boshqaruv buyruqlaridan foydalanishi mumkin:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono text-emerald-400 font-semibold">/on</span>
              <p className="text-slate-400">Botning avtomatik javob berish rejimini yoqadi.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono text-red-400 font-semibold">/off</span>
              <p className="text-slate-400">Botni butunlay to'xtatadi (hech qanday xabarga javob bermaydi).</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono text-amber-400 font-semibold">/pause &lt;chat_id&gt; [daqiqa]</span>
              <p className="text-slate-400">Belgilangan chatni ma'lum vaqtga pauzaga qo'yadi (sukut bo'yicha 30 min).</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-mono text-blue-400 font-semibold">/resume &lt;chat_id&gt;</span>
              <p className="text-slate-400">Pauzadagi chatni muddatidan oldin qayta faollashtiradi.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 col-span-full">
              <span className="font-mono text-purple-400 font-semibold">/stats</span>
              <p className="text-slate-400">Jami xabarlar soni, faol chatlar, pauzalar va bot holati haqida hisobot beradi.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Steps Navigation list */}
      <div className="md:col-span-4 space-y-2">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStep(s.id)}
            className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition ${
              activeStep === s.id
                ? 'bg-blue-600/15 border-blue-500/40 text-blue-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {s.icon}
              <span className="text-xs">{s.title}</span>
            </div>
            <ChevronRight className={`w-4 h-4 transition ${activeStep === s.id ? 'rotate-90 text-blue-400' : 'text-slate-600'}`} />
          </button>
        ))}
      </div>

      {/* Step Detail Content */}
      <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800">
          {steps.find(s => s.id === activeStep)?.icon}
          <h3 className="font-bold text-slate-100 text-base">
            {steps.find(s => s.id === activeStep)?.title}
          </h3>
        </div>

        <div>
          {steps.find(s => s.id === activeStep)?.content}
        </div>
      </div>
    </div>
  );
};
