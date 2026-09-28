import React, { useState, useEffect, useRef } from 'react';
import { BotConfig, ChatMessage, OwnerAlert } from '../types/bot';
import { GoogleGenAI } from '@google/genai';
import { 
  Send, 
  User, 
  Bot as BotIcon, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  CheckCheck,
  AlertTriangle,
  Play,
  UserCheck
} from 'lucide-react';

interface ChatSimulatorProps {
  config: BotConfig;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ config }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'user',
      senderName: 'Mijoz (Jasur)',
      text: 'Assalomu alaykum! Sizga Telegram bot loyihasi bo\'yicha yozayotgandim.',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      status: 'sent'
    },
    {
      id: '2',
      sender: 'bot',
      senderName: config.ownerName,
      text: `Salom, yaxshimisiz! Qanday bot yasamoqchisiz, qisqacha tushuntirib bera olasizmi? 👍`,
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      status: 'sent'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [activeRole, setActiveRole] = useState<'user' | 'owner'>('user');
  const [isTyping, setIsTyping] = useState(false);
  const [typingRemainingSec, setTypingRemainingSec] = useState(0);
  const [debounceSecondsLeft, setDebounceSecondsLeft] = useState<number | null>(null);
  const [isOwnerPaused, setIsOwnerPaused] = useState(false);
  const [pauseMinutesRemaining, setPauseMinutesRemaining] = useState<number>(30);
  const [alerts, setAlerts] = useState<OwnerAlert[]>([]);
  const [pendingUserTexts, setPendingUserTexts] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);
  const typingTimerRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, debounceSecondsLeft]);

  // Handle owner pause timer countdown
  useEffect(() => {
    let interval: any;
    if (isOwnerPaused && pauseMinutesRemaining > 0) {
      interval = setInterval(() => {
        setPauseMinutesRemaining((prev) => {
          if (prev <= 1) {
            setIsOwnerPaused(false);
            return 30;
          }
          return prev - 1;
        });
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isOwnerPaused, pauseMinutesRemaining]);

  const triggerBotResponse = async (combinedText: string, currentHistory: ChatMessage[]) => {
    setIsTyping(true);

    // Calculate human-like typing delay based on text length: min 2s, max 8s
    const estimatedLength = Math.max(30, combinedText.length);
    const calculatedDelay = Math.min(
      config.maxTypingDelay,
      Math.max(config.minTypingDelay, 1.8 + estimatedLength * 0.035)
    );

    setTypingRemainingSec(Math.round(calculatedDelay));

    // Countdown effect for typing
    let currentSec = Math.round(calculatedDelay);
    typingTimerRef.current = setInterval(() => {
      currentSec -= 1;
      if (currentSec <= 0) {
        clearInterval(typingTimerRef.current);
      }
      setTypingRemainingSec(Math.max(0, currentSec));
    }, 1000);

    let reply = '';
    let alertReason: string | null = null;

    try {
      // Check for sensitive triggers
      const lower = combinedText.toLowerCase();
      if (lower.includes('karta') || lower.includes('card') || lower.includes('plastik') || lower.includes('click') || lower.includes('payme')) {
        alertReason = "Mijoz to'lov rekvizitlari yoki karta raqami so'radi";
        reply = `To'lov va hisob-kitob masalalarini ${config.ownerName} o'zi hal qiladi. Hozir unga xabar qoldirdim, o'zi sizga yozadi.`;
      } else if (lower.includes('botmisan') || lower.includes('ai misan') || lower.includes('robotmisan')) {
        reply = `Men ${config.ownerName} ning yordamchisiman, u hozir band bo'lgani uchun men javob beryapman.`;
      } else if (lower.includes('narx') || lower.includes('qancha') || lower.includes('qimmat')) {
        reply = `${config.pricingInfo} Loyihangiz talablarini yozsangiz, ${config.ownerName} aniq hisoblab beradi.`;
      } else if (lower.includes('xizmat') || lower.includes('nima qilasiz')) {
        reply = `Asosiy yo'nalishlar: ${config.servicesInfo}`;
      } else if (lower.includes('ish vaqti') || lower.includes('qachon')) {
        reply = `Ish vaqti: ${config.workingHours}. ${config.currentStatus ? `Hozirgi holat: ${config.currentStatus}.` : ''}`;
      } else if (config.geminiApiKey && !config.geminiApiKey.startsWith('AIzaSyYour')) {
        // Live Gemini call via GoogleGenAI SDK
        const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        const systemPrompt = `Sen ${config.ownerName} ning shaxsiy yordamchisisan va u band bo'lgan paytda uning Telegram akkauntidan shaxsiy yozishmalarga javob berasan. Maqsading: suhbatdosh o'zini tinglangan va to'g'ri tushunilgan his qilsin, ortiqcha robotlik bo'lmasin.

## Kim haqida
Ismi: ${config.ownerName}, Yoshi: ${config.ownerAge || "26 yosh"}, Shahar: ${config.ownerCity}.
Kasbi: ${config.ownerProfession}.
Xizmatlari: ${config.servicesInfo}
Narxlar: ${config.pricingInfo}
Ish vaqti: ${config.workingHours}
Hozirgi holati: ${config.currentStatus || "Bandman"}

## Yozish uslubi
- Qisqa va tabiiy: odatda 1-3 gap. Savol oddiy bo'lsa, bir gap yetadi.
- Suhbatdosh tilida yoz (o'zbek lotin, rus, ingliz). Uning uslubini ko'zgudek moslashtir.
- "Sizga qanday yordam bera olaman?", "Albatta!", "Xursandman" kabi robot iboralarini ishlatma.
- Ro'yxat, sarlavha, qalin yozuv ishlatma. Oddiy matn bilan yoz.
- Bilmasang o'ylab topma: "Buni aniq bilmayman, ${config.ownerName} ga aytib qo'yaman, o'zi javob beradi."
- Karta, to'lov, shartnoma so'ralsa rad et va [ALERT: sabab] tegini yoz.
- "Botmisan?" deb jiddiy so'ralsa: "Men ${config.ownerName} ning yordamchisiman, u hozir band bo'lgani uchun men javob beryapman." deb ayt.`;

        const historyContent = currentHistory.slice(-8).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        const response = await ai.models.generateContent({
          model: config.geminiModel || 'gemini-2.5-flash',
          contents: [
            ...historyContent,
            { role: 'user', parts: [{ text: combinedText }] }
          ],
          config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: 250,
            temperature: 0.6
          }
        });

        const raw = response.text || '';
        const alertMatch = raw.match(/\[ALERT:\s*(.*?)\]/i);
        if (alertMatch) {
          alertReason = alertMatch[1].trim();
          reply = raw.replace(/\[ALERT:\s*(.*?)\]/i, '').trim();
        } else {
          reply = raw.trim();
        }
      } else {
        reply = `Tushunarli. Loyiha bo'yicha ma'lumotlarni yozib qoldirsangiz, ${config.ownerName} ko'rib chiqishi bilan yozadi.`;
      }
    } catch (e: any) {
      console.warn('Gemini inference error:', e);
      reply = `Xabaringizni oldim, ${config.ownerName} hozir band edi, tez orada o'zi sizga javob beradi 👍`;
    }

    // Wait until typing delay finishes
    await new Promise((resolve) => setTimeout(resolve, calculatedDelay * 1000));
    clearInterval(typingTimerRef.current);
    setIsTyping(false);

    // Split into 2 parts if reply is long (> 110 chars and has sentences)
    const sentences = (reply || '').split(/(?<=[.!?\n])\s+/).filter(Boolean);
    const shouldSplit = (reply || '').length > 110 && sentences.length >= 2;

    if (shouldSplit) {
      const mid = Math.ceil(sentences.length / 2);
      const part1 = sentences.slice(0, mid).join(' ');
      const part2 = sentences.slice(mid).join(' ');

      // Part 1
      const botMsg1: ChatMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        senderName: config.ownerName,
        text: part1,
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages((prev) => [...prev, botMsg1]);

      // 1.5s typing delay before part 2
      setIsTyping(true);
      setTypingRemainingSec(2);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsTyping(false);

      // Part 2
      const botMsg2: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        senderName: config.ownerName,
        text: part2,
        timestamp: new Date(),
        status: 'sent',
        hasAlert: Boolean(alertReason),
        alertReason: alertReason || undefined
      };
      setMessages((prev) => [...prev, botMsg2]);
    } else {
      // Single message
      const botMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        senderName: config.ownerName,
        text: reply || `Tushunarli, tez orada bog'lanamiz!`,
        timestamp: new Date(),
        status: 'sent',
        hasAlert: Boolean(alertReason),
        alertReason: alertReason || undefined
      };
      setMessages((prev) => [...prev, botMsg]);
    }

    // If alert triggered, notify owner feed
    if (alertReason) {
      const newAlert: OwnerAlert = {
        id: Date.now().toString(),
        senderName: 'Jasur (Mijoz)',
        senderId: '7829104',
        reason: alertReason,
        userMessage: combinedText,
        botReply: reply,
        timestamp: new Date()
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const currentText = inputText.trim();
    setInputText('');

    if (activeRole === 'owner') {
      // Owner takeover logic
      const ownerMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'owner',
        senderName: `${config.ownerName} (Siz - Shaxsan)`,
        text: currentText,
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages((prev) => [...prev, ownerMsg]);
      setIsOwnerPaused(true);
      setPauseMinutesRemaining(config.takeoverMinutes);

      // Cancel any ongoing debouncer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        setDebounceSecondsLeft(null);
        setPendingUserTexts([]);
      }
      return;
    }

    // User message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: 'Mijoz (Jasur)',
      text: currentText,
      timestamp: new Date(),
      status: isOwnerPaused ? 'sent' : 'debouncing'
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // If chat is paused by owner, bot doesn't reply!
    if (isOwnerPaused) {
      return;
    }

    // Debounce accumulation
    const newPending = [...pendingUserTexts, currentText];
    setPendingUserTexts(newPending);

    // Reset debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setDebounceSecondsLeft(config.debounceSeconds);
    const startTime = Date.now();
    const durationMs = config.debounceSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const left = Math.max(0, (durationMs - elapsed) / 1000);
      setDebounceSecondsLeft(Number(left.toFixed(1)));
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 100);

    debounceTimerRef.current = setTimeout(() => {
      clearInterval(interval);
      setDebounceSecondsLeft(null);
      const combined = newPending.join('\n');
      setPendingUserTexts([]);
      triggerBotResponse(combined, updatedMessages);
    }, durationMs);
  };

  const handleQuickQuestion = (text: string) => {
    setInputText(text);
  };

  const resetChat = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setIsTyping(false);
    setDebounceSecondsLeft(null);
    setIsOwnerPaused(false);
    setPendingUserTexts([]);
    setMessages([
      {
        id: '1',
        sender: 'user',
        senderName: 'Mijoz (Jasur)',
        text: 'Assalomu alaykum! Xizmatlaringiz haqida ma\'lumot bera olasizmi?',
        timestamp: new Date(),
        status: 'sent'
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      {/* Telegram Chat Viewport */}
      <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Telegram Header */}
        <div className="bg-slate-850 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                J
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-sm">Jasur Xoliqov</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                  Chat ID: 7829104
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                {isTyping ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium animate-pulse">
                    <span>{config.ownerName} nomidan yozilmoqda...</span>
                    <span>({typingRemainingSec}s)</span>
                  </span>
                ) : isOwnerPaused ? (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Egasi chatda — Bot {pauseMinutesRemaining} min jim turadi</span>
                  </span>
                ) : (
                  <span>Telegram Business Chat Automation faol</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 transition flex items-center gap-1.5"
              title="Chatni tozalash"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tozalash</span>
            </button>
          </div>
        </div>

        {/* Human Takeover Notice banner */}
        {isOwnerPaused && (
          <div className="bg-amber-950/40 border-b border-amber-900/50 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Siz shaxsan javob berdingiz:</strong> Bot ushbu chatda 30 daqiqa hech qanday avtomatik javob qaytarmaydi.
              </span>
            </div>
            <button
              onClick={() => setIsOwnerPaused(false)}
              className="text-xs underline hover:text-amber-100 font-medium shrink-0 ml-2"
            >
              Pauzani bekor qilish (/resume)
            </button>
          </div>
        )}

        {/* Debounce Notice Bar */}
        {debounceSecondsLeft !== null && (
          <div className="bg-blue-950/60 border-b border-blue-900/60 px-4 py-2 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
              <span>
                <strong>Debounce faol:</strong> Yangi xabarlar birlashtirilmoqda... ({debounceSecondsLeft}s qoldi)
              </span>
            </div>
            <div className="w-24 bg-blue-900/40 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-400 h-full transition-all duration-100" 
                style={{ width: `${(debounceSecondsLeft / config.debounceSeconds) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Messages Body */}
        <div className="p-4 overflow-y-auto space-y-3 min-h-[380px] max-h-[480px] bg-slate-950/50">
          {messages.map((msg) => {
            const isMe = msg.sender === 'bot' || msg.sender === 'owner';
            const isOwner = msg.sender === 'owner';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${
                    isOwner
                      ? 'bg-amber-700 text-amber-50 rounded-br-xs'
                      : isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-80 font-medium">
                    <span>
                      {isOwner ? '👑 Egasi (Shaxsan)' : isMe ? `🤖 ${config.ownerName} nomidan (AI)` : msg.senderName}
                    </span>
                    <span>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Alert Tag indicator */}
                  {msg.hasAlert && (
                    <div className="mt-2 pt-2 border-t border-blue-400/30 text-[11px] text-amber-200 flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                      <span>Egasiga shaxsiy ogohlantirish yuborildi</span>
                    </div>
                  )}

                  {/* Status checkmark */}
                  {isMe && (
                    <div className="flex justify-end mt-1 text-blue-200">
                      <CheckCheck className="w-3.5 h-3.5 opacity-90" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-850 px-3 py-2 rounded-xl max-w-xs border border-slate-800 animate-pulse">
              <BotIcon className="w-4 h-4 text-emerald-400" />
              <span>
                {config.ownerName} yozmoqda... ({typingRemainingSec} soniya)
              </span>
              <div className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Test Prompt Buttons */}
        <div className="bg-slate-900 border-t border-slate-800 p-2.5 flex items-center gap-2 overflow-x-auto text-xs text-slate-300">
          <span className="text-slate-500 font-medium shrink-0 ml-1">Sinov savollari:</span>
          <button
            onClick={() => handleQuickQuestion("Narxlaringiz qancha va nimalar qilasiz?")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 shrink-0 border border-slate-700/50"
          >
            💰 Narx va xizmatlar
          </button>
          <button
            onClick={() => handleQuickQuestion("To'lov uchun karta raqamingizni tashlab bering")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-amber-300 shrink-0 border border-amber-900/50"
          >
            💳 Karta raqam so'rash (Alert)
          </button>
          <button
            onClick={() => handleQuickQuestion("Sen botmisan yoki odammisan?")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 shrink-0 border border-slate-700/50"
          >
            🤖 Botmisan?
          </button>
          <button
            onClick={() => handleQuickQuestion("Ertaga soat 10 da uchrashsak bo'ladimi?")}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 shrink-0 border border-slate-700/50"
          >
            📅 Uchrashuv taklifi
          </button>
        </div>

        {/* Input Bar & Role Switcher */}
        <div className="p-3 bg-slate-850 border-t border-slate-800 flex flex-col gap-2">
          {/* Role selector */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Kim nomidan yozmoqchisiz:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveRole('user')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeRole === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mijoz (Jasur)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole('owner')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    activeRole === 'owner'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Egasi ({config.ownerName})
                </button>
              </div>
            </div>
            {activeRole === 'owner' && (
              <span className="text-amber-400 text-[11px] font-medium">
                ⚠️ Siz yozsangiz, bot 30 daqiqa ushbu chatda to'xtaydi
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                activeRole === 'user'
                  ? 'Mijoz sifatida xabar yozing (masalan: "Salom, narxlar qanaqa?")...'
                  : `Egasi (${config.ownerName}) sifatida yozing (Human takeover)...`
              }
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg flex items-center justify-center transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel: Owner Private Notifications (ALERT) & Technical Insights */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Owner Private Notification Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-slate-100 text-sm">
                Egasi Chati (Shaxsiy Bildirishnomalar)
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono">
              OWNER_ID: {config.ownerId || '123456789'}
            </span>
          </div>

          <div className="mt-3 text-xs text-slate-400 leading-relaxed">
            Bot javob bera olmaydigan, pul/karta so'ralgan yoki muhim holatlar bu yerga avtomatik bildirishnoma sifatida keladi:
          </div>

          <div className="mt-3 space-y-3 max-h-[320px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Hozircha hech qanday favqulodda ogohlantirish yo'q. Sinov uchun mijozdan karta raqami so'rang!
              </div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/60 text-xs text-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-amber-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{al.reason}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {al.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Kimdan: </span>
                    <span className="font-medium text-slate-100">{al.senderName}</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded text-[11px] text-slate-300 italic border border-slate-800">
                    "{al.userMessage}"
                  </div>
                  <div className="text-[11px] text-emerald-400">
                    Bot javobi: "{al.botReply}"
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Business API Logic Explainer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-xs space-y-3">
          <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
            <BotIcon className="w-4 h-4 text-blue-400" />
            <span>Telegram Business Bot qanday ishlaydi?</span>
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span>
                <strong>Shaxsiy akkaunt nomidan:</strong> Xabarlar bot nomidan emas, sizning Telegram profilingiz nomidan <code>business_connection_id</code> orqali yuboriladi.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span>
                <strong>Insondek debouncing:</strong> Foydalanuvchi "Salom", "Qalaysiz", "Savolim bor edi" deb ketma-ket yozsa, bot {config.debounceSeconds} soniya kutib, hammasini birlashtirib bitta javob qaytaradi.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <span>
                <strong>Human Takeover (30 min):</strong> Siz o'zingiz Telegram orqali yozsangiz, bot bu chatda 30 daqiqaga to'xtaydi va sizga xalal bermaydi.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
