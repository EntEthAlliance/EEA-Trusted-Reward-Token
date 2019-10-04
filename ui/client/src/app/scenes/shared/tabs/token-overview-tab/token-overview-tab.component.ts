import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthService } from '@eea/core/auth/auth.service';
import { EmployeeApiService } from '../../../employee/api/employee-api.service';
import { MemberApiService } from '../../../member/api/member-api.service';

export interface UserBalance {
  EEAReputation: number;
  EEAReward?: number;
}

@Component({
  selector: 'eea-token-overview-tab',
  templateUrl: './token-overview-tab.component.html',
  styleUrls: ['./token-overview-tab.component.scss'],
})
export class TokenOverviewTabComponent {
  roleSet = {
    employee: this.employeeApi,
    member: this.memberApi,
  };

  isFullBalance: boolean;

  currentUserBalance$: Observable<UserBalance> = this.roleSet[this.auth.user.role]
    .getBalance()
    .pipe(
      tap((balance: UserBalance) => {
        if (balance) {
          this.isFullBalance =
            balance.EEAReputation !== undefined && balance.EEAReward !== undefined;
        }
      })
    );

  constructor(
    private employeeApi: EmployeeApiService,
    private memberApi: MemberApiService,
    private auth: AuthService
  ) {}
}
