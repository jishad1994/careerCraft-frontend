export interface ISubscriptionAddon {
    _id: string;
    name: string;
    description: string;
    type: "jobs" | "resumeViews" | "featuredJobs";
    quantity: number;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISubscriptionAddonWithUsage extends ISubscriptionAddon {
  currentLimit: number;
  currentAddonLimit: number;
  currentUsage: number;
}
