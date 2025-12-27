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
            '../features/admin/skills/skill-management/skill-management.component'
          ).then((m) => m.SkillManagementComponent),
      },
    ],
  },
];
