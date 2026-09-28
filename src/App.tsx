/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BotConfig } from './types/bot';
import { ChatSimulator } from './components/ChatSimulator';
import { ConfigBuilder } from './components/ConfigBuilder';
import { CodeExplorer } from './components/CodeExplorer';
import { SetupGuide } from './components/SetupGuide';
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  Code2, 
  BookOpen, 
  Download, 
  Zap, 
  Shield, 
  UserCheck 
} from 'lucide-react';
import JSZip from 'jszip';
import { sourceFiles } from './data/sourceCode';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'config' | 'code' | 'guide'>('simulator');

  const [config, setConfig] = useState<BotConfig>({
    ownerName: 'Ali Valiyev',
    ownerAge: '26 yosh',
    ownerProfession: 'Full-stack dasturchi va Telegram Bot mutaxassisi',
    ownerCity: 'Toshkent',
    ownerContact: '+998 90 123 45 67',
    currentStatus: 'Hozirda yangi loyiha ustida ishlayapman, kechqurun bo\'shayman',
    servicesInfo: 'Telegram botlar, CRM integratsiya, veb-saytlar va avtomatlashtirish tizimlari yaratish.',
    pricingInfo: 'Loyihalar murakkabligiga qarab $300 dan boshlanadi. Aniq narx texnik topshiriq (TT) asosida belgilanadi.',
    workingHours: 'Dushanba - Shanba, 09:00 dan 19:00 gacha',
    botToken: '8664833472:AAESPUrLCM8gUlCy6Zhkgt45hNZdDAC6Sfk',
    ownerId: '7434681665',
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    excludedUserIds: '987654321, 112233445',
    takeoverMinutes: 30,
    debounceSeconds: 3.5,
    minTypingDelay: 2.0,
    maxTypingDelay: 8.0
  });

  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      sourceFiles.forEach((file) => {
        zip.file(file.name, file.getContent(config));
      });

      const envExample = sourceFiles.find(f => f.name === '.env.example');
      if (envExample) {
        zip.file('.env', envExample.getContent(config));
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'telegram-business-bot.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-sm sm:text-base leading-tight">
                  Telegram Business AI Bot
                </h1>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-blue-950 text-blue-300 border border-blue-800">
                  aiogram 3.x
                </span>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Gemini API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Shaxsiy profilingiz nomidan insondek muloqot qiluvchi avtomatlashtirilgan bot
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isZipping ? 'Arxivlanmoqda...' : 'Loyiha ZIP yuklab olish'}
              </span>
              <span className="sm:hidden">ZIP</span>
            </button>
          </div>
        </div>

        {/* Feature Badges Sub-bar */}
        <div className="bg-slate-900/70 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto text-[11px] text-slate-400 flex items-center gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Shaxsiy akkaunt nomidan (business_connection_id)</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Debouncing ({config.debounceSeconds}s ketma-ket xabarlar)</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Human Takeover (Siz yozsangiz 30 min jim turadi)</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Insoniy typing kechikish ({config.minTypingDelay}-{config.maxTypingDelay}s)</span>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 border-t border-slate-800/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'simulator'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Jonli Simulyator (Telegram Web)</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Shaxsiyat & Sozlamalar (.env & Prompt)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'code'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Python Kodlar ({sourceFiles.length} ta fayl)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 flex items-center gap-2 transition shrink-0 ${
              activeTab === 'guide'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>BotFather & Server Qo'llanmasi</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulator' && <ChatSimulator config={config} />}
        {activeTab === 'config' && <ConfigBuilder config={config} onChange={setConfig} />}
        {activeTab === 'code' && <CodeExplorer config={config} />}
        {activeTab === 'guide' && <SetupGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        Telegram Premium Chat Automation &bull; aiogram 3.17+ &bull; Google Gemini API &bull; aiosqlite
      </footer>
    </div>
  );
}
