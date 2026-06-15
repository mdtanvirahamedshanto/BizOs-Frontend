export interface TelegramAccount {
  connected: boolean;
  username?: string;
  userId?: string;
  firstName?: string;
  photoUrl?: string;
  linkedAt?: string;
}

export interface TelegramBot {
  connected: boolean;
  botUsername?: string;
  botName?: string;
  token?: string;
  settings: {
    sendDailyReport: boolean;
    sendLowStockAlert: boolean;
    sendDueNotification: boolean;
  };
}

export interface TelegramCommand {
  key: string; // e.g. 'sales', 'due', 'stock', 'help'
  command: string; // e.g. '/sales'
  description: string;
  replyTemplate: string;
  usageCount: number;
  enabled: boolean;
}

export interface TelegramLog {
  id: string;
  chatId: string;
  userTelegram: string;
  incomingText: string;
  outgoingText: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export interface TelegramMetrics {
  totalCommandsProcessed: number;
  activeUsersCount: number;
  commandsUsage: { command: string; count: number }[];
  trafficChart: { date: string; sent: number; received: number }[];
}
