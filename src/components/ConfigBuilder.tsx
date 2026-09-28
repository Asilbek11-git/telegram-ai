import React from 'react';
import { BotConfig } from '../types/bot';
import { Settings, User, Briefcase, Key, Clock, ShieldCheck, Activity } from 'lucide-react';

interface ConfigBuilderProps {
  config: BotConfig;
  onChange: (updated: BotConfig) => void;
}

export const ConfigBuilder: React.FC<ConfigBuilderProps> = ({ config, onChange }) => {
  const handleChange = (field: keyof BotConfig, value: any) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  const applyPreset = (presetType: 'developer' | 'designer' | 'lawyer' | 'smm') => {
    if (presetType === 'developer') {
      onChange({
        ...config,
        ownerName: 'Ali Valiyev',
        ownerAge: '26 yosh',
        ownerProfession: 'Full-stack dasturchi va Telegram Bot mutaxassisi',
        ownerCity: 'Toshkent',
        currentStatus: 'Hozirda yangi loyiha ustida ishlayapman, kechqurun bo\'shayman',
        servicesInfo: 'Telegram botlar, CRM tizimlar, veb-saytlar va mobil ilovalar yaratish.',
        pricingInfo: 'Loyihalar murakkabligiga qarab $300 dan boshlanadi. Aniq narx texnik topshiriq (TT) asosida hisoblanadi.',
        workingHours: 'Dushanba - Shanba, 09:00 dan 19:00 gacha'
      });
    } else if (presetType === 'designer') {
      onChange({
        ...config,
        ownerName: 'Madina Karimova',
        ownerAge: '24 yosh',
        ownerProfession: 'UI/UX dizayner va brending mutaxassisi',
        ownerCity: 'Samarqand',
        currentStatus: 'Mijoz taqdimotidaman, soat 17:00 dan keyin javob yozaman',
        servicesInfo: 'Mobil ilovalar va veb-saytlar dizayni, logotip, brendbuk va bannerlar.',
        pricingInfo: 'Logotip $150 dan, sayt sahifasi dizayni $50 dan boshlanadi.',
        workingHours: 'Har kuni 10:00 dan 20:00 gacha'
      });
    } else if (presetType === 'lawyer') {
      onChange({
        ...config,
        ownerName: 'Javohir Rustamov',
        ownerAge: '32 yosh',
        ownerProfession: 'Biznes va fuqarolik ishlari bo\'yicha advokat',
        ownerCity: 'Toshkent',
        currentStatus: 'Sud majlisidaman, tushdan keyin aloqaga chiqaman',
        servicesInfo: 'Shartnomalarni tekshirish, sud jarayonlarida himoya, yuridik konsultatsiya.',
        pricingInfo: 'Dastlabki 30 daqiqalik konsultatsiya 300,000 so\'m.',
        workingHours: 'Dushanba - Juma, 09:00 dan 18:00 gacha'
      });
    } else if (presetType === 'smm') {
      onChange({
        ...config,
        ownerName: 'Bekzod Aliyev',
        ownerAge: '28 yosh',
        ownerProfession: 'Targetolog va SMM agentligi rahbari',
        ownerCity: 'Toshkent',
        currentStatus: 'Suratlarga olish jarayonidamiz, 1-2 soatda javob yozaman',
        servicesInfo: 'Instagram va Telegramda target reklama yoqish, kontent reja, sotuv voronkalari.',
        pricingInfo: 'Oylik kompleks xizmat $400 dan boshlanadi.',
        workingHours: 'Dushanba - Shanba, 10:00 dan 19:00 gacha'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-semibold text-slate-100">
            Kasbiy shablonlar (1-bosishda to'ldirish):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset('developer')}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-medium transition"
          >
            💻 Dasturchi / Frilanser
          </button>
          <button
            type="button"
            onClick={() => applyPreset('designer')}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-medium transition"
          >
            🎨 UI/UX Dizayner
          </button>
          <button
            type="button"
            onClick={() => applyPreset('smm')}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-medium transition"
          >
            📈 Target / SMM
          </button>
          <button
            type="button"
            onClick={() => applyPreset('lawyer')}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-medium transition"
          >
            ⚖️ Advokat / Yurist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shaxsiy Ma'lumotlar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-100 font-semibold text-sm">
            <User className="w-4 h-4 text-blue-400" />
            <span>1. Shaxsiy Ma'lumotlar (Egasi shaxsiyati)</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ismingiz (OWNER_NAME)
              </label>
              <input
                type="text"
                value={config.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="Ali Valiyev"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Yoshingiz (OWNER_AGE)
              </label>
              <input
                type="text"
                value={config.ownerAge}
                onChange={(e) => handleChange('ownerAge', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="26 yosh"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Kasbingiz va Yo'nalishingiz (OWNER_PROFESSION)
            </label>
            <input
              type="text"
              value={config.ownerProfession}
              onChange={(e) => handleChange('ownerProfession', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="Full-stack dasturchi va Telegram Bot mutaxassisi"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Yashash shahringiz (OWNER_CITY)
              </label>
              <input
                type="text"
                value={config.ownerCity}
                onChange={(e) => handleChange('ownerCity', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="Toshkent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Aloqa (Telefon / Sayt)
              </label>
              <input
                type="text"
                value={config.ownerContact}
                onChange={(e) => handleChange('ownerContact', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="+998 90 123 45 67"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Hozirgi holatingiz (CURRENT_STATUS)</span>
              <span className="text-[10px] text-amber-400 font-normal">Bandlik holati</span>
            </label>
            <input
              type="text"
              value={config.currentStatus}
              onChange={(e) => handleChange('currentStatus', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="Masalan: Hozirda yangi loyiha ustida ishlayapman, kechqurun bo'shayman"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Ish vaqtingiz (WORKING_HOURS)
            </label>
            <input
              type="text"
              value={config.workingHours}
              onChange={(e) => handleChange('workingHours', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="Dushanba - Shanba, 09:00 dan 19:00 gacha"
            />
          </div>
        </div>

        {/* Xizmatlar va Narxlar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-100 font-semibold text-sm">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>2. Xizmatlar va Narxlar siyosati</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Ko'rsatadigan xizmatlaringiz tavsifi (SERVICES_INFO)
            </label>
            <textarea
              rows={3}
              value={config.servicesInfo}
              onChange={(e) => handleChange('servicesInfo', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="Telegram botlar, CRM tizimlar, veb-saytlar va mobil ilovalar yaratish."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Narxlar siyosati (PRICING_INFO)
            </label>
            <textarea
              rows={3}
              value={config.pricingInfo}
              onChange={(e) => handleChange('pricingInfo', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="Loyihalar murakkabligiga qarab $300 dan boshlanadi. Aniq narx texnik topshiriq (TT) asosida hisoblanadi."
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>
              <strong>Yozish qoidasi:</strong> Ro'yxatlar, sarlavhalar va qalin shriftlar ishlatilmaydi. Bot xuddi haqiqiy inson kabi 1-3 ta lo'nda va tabiiy gap bilan javob beradi.
            </span>
          </div>
        </div>

        {/* Texnik Kalitlar va API */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-100 font-semibold text-sm">
            <Key className="w-4 h-4 text-purple-400" />
            <span>3. Texnik Sozlamalar va API Kalitlari</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Telegram Bot Token (BOT_TOKEN)
            </label>
            <input
              type="text"
              value={config.botToken}
              onChange={(e) => handleChange('botToken', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxyz"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              @BotFather orqali olingan token
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Egasining Telegram ID si (OWNER_ID)
              </label>
              <input
                type="text"
                value={config.ownerId}
                onChange={(e) => handleChange('ownerId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                placeholder="123456789"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Gemini Model
              </label>
              <select
                value={config.geminiModel}
                onChange={(e) => handleChange('geminiModel', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Tezkor va insondek - Standart)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Yuqori sifat & tahlil)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Eng so'nggi Flash)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Google Gemini API Kaliti (GEMINI_API_KEY)
            </label>
            <input
              type="password"
              value={config.geminiApiKey}
              onChange={(e) => handleChange('geminiApiKey', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              placeholder="AIzaSy..."
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Google AI Studio (aistudio.google.com) dan olinadi
            </span>
          </div>
        </div>

        {/* Xulq-atvor va Istisnolar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-100 font-semibold text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>4. Xulq-atvor Vaqtlari va Istisnolar</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Bot javob bermaydigan ID lar (Oila va Do'stlar)
            </label>
            <input
              type="text"
              value={config.excludedUserIds}
              onChange={(e) => handleChange('excludedUserIds', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              placeholder="987654321, 112233445"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Vergul bilan ajrating. Bu ID lardan kelgan xabarlarga bot aralashmaydi.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Egasi yozgach jim turish
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={config.takeoverMinutes}
                  onChange={(e) => handleChange('takeoverMinutes', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">daqiqa</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Xabarlarni birlashtirish
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={config.debounceSeconds}
                  onChange={(e) => handleChange('debounceSeconds', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">soniya</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Min. typing kechikish
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={config.minTypingDelay}
                  onChange={(e) => handleChange('minTypingDelay', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">soniya</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Maks. typing kechikish
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={config.maxTypingDelay}
                  onChange={(e) => handleChange('maxTypingDelay', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">soniya</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
