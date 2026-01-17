import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../layouts/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),

    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import(
            '../pages/user/user-landing-page/user-landing-page.component'
          ).then((m) => m.UserLandingPageComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../features/user/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          ),
      },
      {
        path: 'jobs/:slug',
        loadComponent: () =>
          import(
            '../features/user/jobs/user-job-view/user-job-view.component'
          ).then((m) => m.UserJobViewComponent),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import(
            '../features/user/jobs/job-search/user-job-search.component'
          ).then((m) => m.UserJobSearchComponent),
      },

      {
        path: 'my-applications',
        loadChildren: () =>
          import('./user/applications.routes').then(
            (m) => m.userJobApplicationRoutes
          ),
      },

      { path: '**', redirectTo: 'home' },
    ],
  },
];
