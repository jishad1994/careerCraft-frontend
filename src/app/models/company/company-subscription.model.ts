// Frontend: src/app/models/subscription.model.ts

export interface SubscriptionLimits {
  jobs: number;
  resumeViews: number;
  featuredJobs: number;
}

export interface SubscriptionFeatures {
  chat: boolean;
  videoCall: boolean;
  analytics: boolean;
}

export interface SubscriptionUsage {
  jobsPosted: number;
  resumesViewed: number;
  featuredUsed: number;
  lastResetAt?: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

// export interface SubscriptionPlan {
//   _id: string;
//   name: string;
//   price: number;
//   durationInDays: number;
//   limits: SubscriptionLimits;
//   features: SubscriptionFeatures;
//   isActive: boolean;
//   description?: string;
//   createdAt: string;
//   updatedAt: string;
// }

export interface SubscriptionSnapshot {
  name: string;
  price: number;
  durationInDays: number;
  limits: SubscriptionLimits;
  features: SubscriptionFeatures;
}

export interface CompanySubscription {
  _id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  usage: SubscriptionUsage;
  paymentId: string;
  cancelledAt?: string;
  cancelReason?: string;
  snapShot: SubscriptionSnapshot;
  autoRenew: boolean;
  previousSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}


export interface RemainingLimits {
    jobs: number;
    resumeViews: number;
    featuredJobs: number;
}
