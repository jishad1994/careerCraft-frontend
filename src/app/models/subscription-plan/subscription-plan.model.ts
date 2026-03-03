export interface ISubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  limits: {
    jobs: number;
    resumeViews: number;
    featuredJobs: number;
  };
  features: {
    chat: boolean;
    videoCall: boolean;
    analytics: boolean;
  };
  isActive?: boolean;
  description?: string;
}
