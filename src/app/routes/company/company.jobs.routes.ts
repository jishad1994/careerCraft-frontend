import { Routes } from '@angular/router';

export const companyJobRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../features/company/jobs/job-list/company-job-list.component').then(
        (m) => m.CompanyJobListComponent,
      ),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('../../features/company/jobs/create-job/create-job.component').then(
        (m) => m.CreateJobComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../../features/company/jobs/company-job-view/company-job-view.component').then(
        (m) => m.CompanyJobViewComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../../features/company/jobs/edit-job/edit-job.component').then(
        (m) => m.EditJobComponent,
      ),
  },

  {
    path: ':jobId/applications',
    loadComponent: () =>
      import('../../features/company/applications/company-applications-list/company-applications-list.component').then(
        (m) => m.CompanyApplicationsListComponent,
      ),
  },
];
