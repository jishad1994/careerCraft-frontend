import { Routes } from '@angular/router';

export const companyInterviewRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../features/company/interview/interview-listing/company-interview-listing.component').then(
        (m) => m.CompanyInterviewListingComponent,
      ),
  },
  {
    path: ':interviewId',
    loadComponent: () =>
      import('../../features/company/interview/company-interview-details/company-interview-details.component').then(
        (m) => m.CompanyInterviewDetailsComponent,
      ),
  },
];
