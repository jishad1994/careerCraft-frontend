import { Routes } from '@angular/router';

export const adminSubscriptionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../features/admin/subscription-plan/subscription-plan-form/subscription-plan-form.component').then(
        (m) => m.SubscriptionPlanFormComponent,
      ),
  },
];
