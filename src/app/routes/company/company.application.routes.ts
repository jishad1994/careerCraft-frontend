import { Routes } from '@angular/router';

export const companyApplicationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../features/company/applications/company-applications-list/company-applications-list.component').then(
        (m) => m.CompanyApplicationsListComponent,
      ),
  },
  {
    path: ':applicationId/interviews/:interviewId/join-interview',
    loadComponent: () =>
      import('../../shared/components/video-call-component/video-call.component').then(
        (m) => m.VideoCallComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../../features/company/applications/company-application-view/company-application-view.component').then(
        (m) => m.CompanyApplicationViewComponent,
      ),
  },
];
