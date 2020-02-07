import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { AuthService } from '@eea/core/auth/auth.service';
import { sortData, TableColumn, TableDataSource, TableLoadParams } from '@eea/table';
import { DialogService } from '@eea/shared/components/dialog/dialog.service';
import { MemberApiService } from '../../../member/api/member-api.service';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';
import { AdminApiService } from '../../../admin/api/admin-api.service';

@Component({
  selector: 'eea-member-orgs-tab',
  templateUrl: './member-orgs-tab.component.html',
  styleUrls: ['./member-orgs-tab.component.scss'],
})
export class MemberOrgsTabComponent {
  columns: TableColumn[] = [
    {
      key: 'name',
      header: 'EEA Member Name',
      template: this.authService.user.role !== 'member' ? 'name' : '',
    },
    {
      key: 'EEAReputation',
      header: 'Reputation',
    },
  ];

  tableDataSource = new TableDataSource((params: TableLoadParams) =>
    this.memberApi.getMembers().pipe(map(arr => sortData(arr, params.sort)))
  );

  constructor(
    private memberApi: MemberApiService,
    private adminApi: AdminApiService,
    private dialogService: DialogService,
    private authService: AuthService,
    private router: Router
  ) {}

  openDialog(): void {
    this.dialogService
      .open(RegisterFormComponent, {
        title: 'Add EEA Member',
        width: '498px',
        data: {
          registerApi: this.adminApi,
        },
      })
      .afterClosed()
      .subscribe(data => {
        if (data) {
          this.tableDataSource.refresh();
        }
      });
  }

  onSelect($event) {
    this.router.navigate([`${this.authService.user.role}/employees`], {
      state: { member: $event },
    });
  }
}
