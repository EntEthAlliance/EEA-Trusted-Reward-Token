import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { LayoutComponent } from '@eea/shared/components/layout/layout.component';
import { TokenOverviewTabComponent } from '../shared/tabs/token-overview-tab/token-overview-tab.component';
import { RedeemTabComponent } from './redeem-tab/redeem-tab.component';
import { ShareTabComponent } from './share-tab/share-tab.component';
import { EmployeesTabComponent } from '../shared/tabs/employees-tab/employees-tab.component';
import { RequestsTabComponent } from './requests-tab/requests-tab.component';
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
    path: 'redeem',
    component: RedeemTabComponent,
    data: {
      name: 'Redeem',
      icon: 'retweet',
    },
  },
  {
    path: 'share',
    component: ShareTabComponent,
    data: {
      name: 'Share',
      icon: 'share',
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
        basePath: '/member',
        routes: ROUTES,
      },
    },
  ],
})
export class MemberRoutingModule {}
