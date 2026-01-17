import { Routes } from '@angular/router';

export const userJobApplicationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        '../../features/user/jobs/user-applications/user-applications.component'
      ).then((m) => m.UserApplicationsComponent),
  },

  {
    path: ':id',
    loadComponent: () =>
      import(
        '../../features/user/jobs/application-view/application-view.component'
      ).then((m) => m.ApplicationViewComponent),
  },
];
