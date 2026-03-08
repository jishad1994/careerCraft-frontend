import { Routes } from '@angular/router';

export const userJobApplicationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../features/user/applications/user-applications/user-applications.component').then(
        (m) => m.UserApplicationsComponent,
      ),
  },
  {
    path: 'interviews',
    loadComponent: () =>
      import('../../pages/user/interview-listing-page/candidate-interview-listing.component').then(
        (m) => m.CandidateInterviewListingComponent,
      ),
  },
  {
    path: 'interviews/:id',
    loadComponent: () =>
      import('../../features/user/interview/interview-details/candidate-interview-details.component').then(
        (m) => m.CandidateInterviewDetailsComponent,
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
      import('../../features/user/applications/application-view/application-view.component').then(
        (m) => m.CandidateApplicationViewComponent,
      ),
  },
];
