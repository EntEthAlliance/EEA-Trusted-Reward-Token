import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './core/auth/components/login/login.component';
import { AuthGuard } from './core/auth/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'employee',
        loadChildren: () => import('./scenes/employee/employee.module').then(m => m.EmployeeModule),
        canLoad: [RoleGuard],
        data: { role: 'employee' },
      },
      {
        path: 'admin',
        loadChildren: () => import('./scenes/admin/admin.module').then(m => m.AdminModule),
        canLoad: [RoleGuard],
        data: { role: 'admin' },
      },
      {
        path: 'member',
        loadChildren: () => import('./scenes/member/member.module').then(m => m.MemberModule),
        canLoad: [RoleGuard],
        data: { role: 'member' },
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: '/employee',
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
