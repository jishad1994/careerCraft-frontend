import { Routes } from '@angular/router';

export const companySubscriptionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../features/company/subscription-management/subscriptions/company-subscription.component').then(
        (m) => m.CompanySubscriptionComponent,
      ),
  },
  {
    path: 'details/:id',
    loadComponent: () =>
      import('../../features/company/subscription-management/plan-details/plan-details.component').then(
        (m) => m.PlanDetailsComponent,
      ),
  },
  {
    path: 'plan/:planId',
    loadComponent: () =>
      import('../../features/company/subscription-management/plan-details/plan-details.component').then(
        (m) => m.PlanDetailsComponent,
      ),
  },
];
