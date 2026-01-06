import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../pages/admin/admin-dahboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    // canActivate: [ RoleGuard],
    // canActivateChild: [RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },

      {
        path: 'jobs',
        loadComponent: () =>
          import(
            '../features/admin/jobs/job-list/admin-job-list.component'
          ).then((m) => m.AdminJobListComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('../features/admin/user-table/user-table.component').then(
            (m) => m.UserTableComponent
          ),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import(
            '../features/admin/companies-table/companies-table.component'
          ).then((m) => m.CompaniesTableComponent),
      },
      {
        path: 'skills-management',
        loadComponent: () =>
          import(
            '../features/admin/skills/skill-management/skill-management.component'
          ).then((m) => m.SkillManagementComponent),
      },
      {
        path: 'skills-management/:id',
        loadComponent: () =>
          import(
            '../features/admin/skills/skill-details/skill-details.component'
          ).then((m) => m.SkillDetailsComponent),
      },
    ],
  },
];
