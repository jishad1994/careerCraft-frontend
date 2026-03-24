import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/user/user-layout/user-layout.component').then(
        (m) => m.UserLayoutComponent,
      ),

    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('../../pages/user/user-landing-page/user-landing-page.component').then(
            (m) => m.UserLandingPageComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../../features/user/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('../../shared/components/notification-component/notifications.component').then(
            (m) => m.NotificationsComponent,
          ),
      },

      {
        path: 'jobs',
        loadChildren: () =>
          import('./user.jobs.routes').then(
            (m) => m.userJobRoutes,
          ),
      },

      {
        path: 'my-applications',
        loadChildren: () =>
          import('./user.applications.routes').then(
            (m) => m.userJobApplicationRoutes,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('../../shared/components/chat/chat-page/chat-page.component').then(
            (m) => m.ChatPageComponent,
          ),
      },

      { path: '**', redirectTo: 'home' },
    ],
  },
];
