import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from '@eea/shared/components/layout/layout.component';
import { TokenOverviewTabComponent } from '../shared/tabs/token-overview-tab/token-overview-tab.component';
import { EmployeesTabComponent } from '../shared/tabs/employees-tab/employees-tab.component';
import { MemberOrgsTabComponent } from '../shared/tabs/member-orgs-tab/member-orgs-tab.component';

const ROUTES: Routes = [
  {
    path: '',
    component: TokenOverviewTabComponent,
    data: {
      name: 'EEA Token Overview',
      icon: 'wallet',
    },
  },
  {
    path: 'member-orgs',
    component: MemberOrgsTabComponent,
    data: {
      name: 'Member orgs',
      icon: 'building',
    },
  },
  {
    path: 'employees',
    component: EmployeesTabComponent,
    data: {
      name: 'Employees',
      icon: 'user',
    },
  },
];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: LayoutComponent,
        children: ROUTES,
      },
    ]),
  ],
  providers: [
    {
      provide: 'RoutesConfig',
      useValue: {
        basePath: '/employee',
        routes: ROUTES,
      },
    },
  ],
})
export class EmployeeRoutingModule {}
