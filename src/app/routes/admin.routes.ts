import { Routes } from '@angular/router';
import { UserTableComponent } from '../features/admin/user-table/user-table.component';
import { CompaniesTableComponent } from '../features/admin/companies-table/companies-table.component';
import { AuthGuard } from '../route-guards/auth.guard';
import { RoleGuard } from '../route-guards/role.guard';
import { AdminDashboardComponent } from '../pages/admin/admin-dahboard/admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    canActivate: [ RoleGuard],
    // canActivateChild: [RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: 'usersTable', component: UserTableComponent },
      { path: 'companiesTable', component: CompaniesTableComponent },
    ],
  },
];
