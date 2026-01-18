import { Routes } from '@angular/router';

export const COMPANY_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../layouts/company/company-layout/company-layout.component').then(
        (m) => m.CompanyLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        loadComponent: () =>
          import(
            '../features/company/profile/company-profile-parent/company-profile.component'
          ).then((m) => m.CompanyProfileComponent),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import(
            '../features/company/jobs/job-list/company-job-list.component'
          ).then((m) => m.CompanyJobListComponent),
      },
      {
        path: 'jobs/create',
        loadComponent: () =>
          import(
            '../features/company/jobs/create-job/create-job.component'
          ).then((m) => m.CreateJobComponent),
      },

      {
        path: 'jobs/:id',
        loadComponent: () =>
          import(
            '../features/company/jobs/company-job-view/company-job-view.component'
          ).then((m) => m.CompanyJobViewComponent),
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () =>
          import('../features/company/jobs/edit-job/edit-job.component').then(
            (m) => m.EditJobComponent
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import(
            '../features/company/applications/applications-list/company-applications-list.component'
          ).then((m) => m.CompanyApplicationsListComponent),
      },
      {
        path: 'applications/:id',
        loadComponent: () =>
          import(
            '../features/company/applications/application-view/company-application-view.component'
          ).then((m) => m.CompanyApplicationViewComponent),
      },
    ],
  },
];
