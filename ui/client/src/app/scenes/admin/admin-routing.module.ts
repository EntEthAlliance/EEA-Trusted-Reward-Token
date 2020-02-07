import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from '@eea/shared/components/layout/layout.component';
import { TokenIssuanceTabComponent } from './token-issuance-tab/token-issuance-tab.component';
import { RequestsTabComponent } from './requests-tab/requests-tab.component';
import { MemberOrgsTabComponent } from '../shared/tabs/member-orgs-tab/member-orgs-tab.component';
import { EmployeesTabComponent } from '../shared/tabs/employees-tab/employees-tab.component';

const ROUTES = [
  {
    path: '',
    component: TokenIssuanceTabComponent,
    data: {
      name: 'EEA Token Issuance',
      icon: 'wallet',
      shouldReuse: true
    },
  },
  {
    path: 'requests',
    component: RequestsTabComponent,
    data: {
      name: 'Requests',
      icon: 'comment-dots',
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
        basePath: '/admin',
        routes: ROUTES,
      },
    },
  ],
})
export class AdminRoutingModule {}
