import { Routes } from '@angular/router';
import { UserTableComponent } from '../features/admin/user-table/user-table.component';
import { CompaniesTableComponent } from '../features/admin/companies-table/companies-table.component';
import { AuthGuard } from '../route-guards/auth.guard';
import { RoleGuard } from '../route-guards/role.guard';
import { AdminDashboardComponent } from '../pages/admin/admin-dahboard/admin-dashboard.component';
import { SkillManagementComponent } from '../features/admin/skills/skill-management/skill-management.component';
import { SkillDetailsComponent } from '../features/admin/skills/skill-details/skill-details.component';

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
