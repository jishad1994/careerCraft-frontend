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
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    PENDING = "pending",
    SUSPENDED = "suspended",
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
export type AddonType = "jobs" | "resumeViews" | "featuredJobs";

export interface IAddon {
    _id?: string;

    addonId: string;
    name: string;

    type: AddonType;

    quantity: number;
    price: number;

    purchasedAt?: Date;

    paymentId?: string;

    createdAt?: Date;
    updatedAt?: Date;
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

    isQueued: boolean;
    queuePosition: number;
    queuedAt: Date;
    scheduledStartDate: Date;
    activatedAt: Date;

    addons: IAddon[];
    addonLimits: {
        jobs: number;
        resumeViews: number;
        featuredJobs: number;
    };

    createdAt: string;
    updatedAt: string;
}

export interface IQueuedSubscriptionDTO {
    companyId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    usage: SubscriptionUsage;
    paymentId: string;
    cancelledAt?: Date;
    cancelReason?: string;
    snapShot: SubscriptionSnapshot;
    autoRenew: boolean;

    isQueued: boolean;
    queuePosition: number;
    queuedAt: Date;
    scheduledStartDate: Date;
    activatedAt: Date;

    addons: IAddon[];
    addonLimits: {
        jobs: number;
        resumeViews: number;
        featuredJobs: number;
    };

    previousSubscriptionId?: string;
    daysUntilStart: number;
}

export interface RemainingLimits {
    jobs: number;
    resumeViews: number;
    featuredJobs: number;
}
