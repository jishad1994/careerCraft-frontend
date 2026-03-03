import { Routes } from '@angular/router';

export const userJobApplicationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        '../../features/user/applications/user-applications/user-applications.component'
      ).then((m) => m.UserApplicationsComponent),
  },

  {
    path: ':id',
    loadComponent: () =>
      import(
        '../../features/user/applications/application-view/application-view.component'
      ).then((m) => m.ApplicationViewComponent),
  },

  
];
