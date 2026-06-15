export interface Tenant {
  id: string;
  merchantName: string;
  ownerName: string;
  phone: string;
  type: 'grocery' | 'clothing' | 'restaurant' | 'hardware' | 'wholesale';
  status: 'active' | 'suspended' | 'trial';
  currentPlan: 'free' | 'basic' | 'premium';
  subscriptionExpiry: string;
  usersCount: number;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  tenantName: string;
  subject: string;
  issueDescription: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  timestamp: string;
  replies: { sender: 'merchant' | 'admin'; message: string; timestamp: string }[];
}

export interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  apiLatency: number; // ms
  websocketConnections: number;
  backgroundJobsCount: number;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SubscriptionPlan {
  id: 'free' | 'basic' | 'premium';
  name: string;
  priceMonthly: number;
  priceYearly: number;
  activeSubscriptionsCount: number;
  maxProductsLimit: number | 'unlimited';
  maxTransactionsLimit: number | 'unlimited';
}
