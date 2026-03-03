import { Routes } from '@angular/router';

export const userJobRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../features/user/jobs/job-search/user-job-search.component').then(
        (m) => m.UserJobSearchComponent,
      ),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('../../features/user/jobs/user-job-view/user-job-view.component').then(
        (m) => m.UserJobViewComponent,
      ),
  },
];
