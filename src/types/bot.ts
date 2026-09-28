export interface BotConfig {
  ownerName: string;
  ownerAge: string;
  ownerProfession: string;
  ownerCity: string;
  ownerContact: string;
  currentStatus: string;
  servicesInfo: string;
  pricingInfo: string;
  workingHours: string;
  botToken: string;
  ownerId: string;
  geminiApiKey: string;
  geminiModel: string;
  excludedUserIds: string;
  takeoverMinutes: number;
  debounceSeconds: number;
  minTypingDelay: number;
  maxTypingDelay: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'owner';
  senderName: string;
  text: string;
  timestamp: Date;
  status?: 'sending' | 'debouncing' | 'sent';
  hasAlert?: boolean;
  alertReason?: string;
}

export interface OwnerAlert {
  id: string;
  senderName: string;
  senderId: string;
  reason: string;
  userMessage: string;
  botReply: string;
  timestamp: Date;
}
