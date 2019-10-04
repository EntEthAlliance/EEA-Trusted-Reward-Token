import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';

import { sortData, TableColumn, TableDataSource, TableLoadParams } from '@eea/table';
import { AuthService } from '@eea/core/auth/auth.service';
import { DialogService } from '@eea/shared/components/dialog/dialog.service';
import { MemberApiService } from '../../../member/api/member-api.service';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';

export interface Member {
  id: number;
  name: string;
}

@Component({
  selector: 'eea-employees-tab',
  templateUrl: './employees-tab.component.html',
  styleUrls: ['./employees-tab.component.scss'],
})
export class EmployeesTabComponent implements OnInit {
  columns: TableColumn[] = [
    {
      key: 'name',
    },
    {
      key: 'parentname',
      header: 'EEA Member Org',
    },
    {
      key: 'EEAReputation',
      header: 'Reputation',
    },
    {
      key: 'email',
    },
    {
      key: 'regdate',
      header: 'Registration Date',
      template: 'date',
    },
  ];

  memberList: Member[];
  userRole = this.authService.user.role;
  selectedMemberId = new FormControl(0);

  tableDataSource = new TableDataSource((params: TableLoadParams) =>
    this.memberApi.getEmployees().pipe(
      map(arr => {
        const filteredArr = arr.filter(el =>
          typeof params.filter.id === 'number' ? el.parentid === params.filter.id : el
        );
        return sortData(filteredArr, params.sort);
      })
    )
  );

  constructor(
    private memberApi: MemberApiService,
    public dialogService: DialogService,
    private authService: AuthService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation.extras.state as { member: number };
    if (state && state.member) {
      this.selectedMemberId.setValue(state.member);
      this.tableDataSource.filter = { id: state.member };
    }
  }

  ngOnInit() {
    if (this.authService.user.role === 'member') {
      this.tableDataSource.filter = { id: this.authService.user._id };
      this.columns.splice(1, 1);
    } else {
      this.memberApi.getMembers().subscribe(data => (this.memberList = data));
    }
  }

  setFilter($event) {
    this.tableDataSource.filter = {
      id: +$event.target.value === 0 ? undefined : +$event.target.value,
    };
  }

  openDialog(): void {
    this.dialogService
      .open(RegisterFormComponent, {
        title: 'Register Employee',
        width: '498px',
        data: {
          registerApi: this.memberApi,
        },
      })
      .afterClosed()
      .subscribe(data => {
        if (data) {
          this.tableDataSource.refresh();
        }
      });
  }
}
