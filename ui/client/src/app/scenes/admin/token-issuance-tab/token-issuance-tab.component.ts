import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AdminApiService } from '../api/admin-api.service';
import { MemberApiService } from '../../member/api/member-api.service';
import { DialogService } from '@eea/shared/components/dialog/dialog.service';
import { SelectMemberOrEmployeeListComponent } from './select-member-or-employee-list/select-member-or-employee-list.component';

export interface Member {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  reputation: number;
  regdate: Date;
  member: string;
}

export interface RewardReasons {
  id: number;
  name: string;
  token_count: number;
}

@Component({
  selector: 'eea-token-issuance-tab',
  templateUrl: './token-issuance-tab.component.html',
  styleUrls: ['./token-issuance-tab.component.scss'],
})
export class TokenIssuanceTabComponent implements OnInit {
  form: FormGroup;

  memberList: Member[];

  currentMember: Member[] = [];

  employeesList: Employee[][] = [];

  rewardReasons: RewardReasons[];

  loading = false;

  currentMemberList$: Observable<Member[]>;

  error;

  constructor(
    private fb: FormBuilder,
    private adminApi: AdminApiService,
    private memberApi: MemberApiService,
    public dialogService: DialogService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      membersArray: this.fb.array([], Validators.required),
    });
    this.currentMemberList$ = this.memberApi.getMembers().pipe(
      tap((memberList: Member[]) => {
        this.memberList = memberList;
      })
    );
    this.adminApi
      .getRewardReasons()
      .subscribe((data: RewardReasons[]) => (this.rewardReasons = data));
  }

  initSection() {
    return this.fb.group({
      employeesArray: this.fb.array([], Validators.required),
    });
  }

  openDialog(itemType: string, index?: number): void {
    let dialogTitle;
    let currentArray;
    const selectedMemberSet = new Set();
    this.currentMember.forEach(el => selectedMemberSet.add(el.id));
    if (itemType === 'member') {
      dialogTitle = 'Select EEA Member';
      currentArray = this.memberList.filter(el => !selectedMemberSet.has(el.id));
    } else if (itemType === 'employee') {
      dialogTitle = 'Select EEA Employee';
      currentArray = this.employeesList[index];
    }

    this.dialogService
      .open(SelectMemberOrEmployeeListComponent, {
        title: dialogTitle,
        width: '498px',
        data: {
          list: currentArray,
          type: itemType,
        },
      })
      .afterClosed()
      .subscribe(data => {
        if (data) {
          if (itemType === 'member' && (data as Member)) {
            this.currentMember.push(data);
            this.createMember();
            this.callForEmployeesList(data.id);
          } else if (itemType === 'employee' && (data as Employee)) {
            this.createEmployee({ id: data.id, name: data.name, rewardReasons: null }, index);
          }
        }
      });
  }

  callForEmployeesList(selectedMember: string) {
    this.memberApi
      .getEmployeesList(selectedMember)
      .subscribe((data: Employee[]) => this.employeesList.push(data));
  }

  getEmployeesArray(form) {
    return form.controls.employeesArray.controls;
  }

  getMembersArray(form) {
    return form.controls.membersArray.controls;
  }

  get isMemberSelected() {
    return this.currentMember.length !== 0;
  }

  createEmployee(item, index: number) {
    const createdItem = this.fb.group({
      id: [item.id, Validators.required],
      name: [item.name, Validators.required],
      rewardReasons: ['', Validators.required],
      confirm: [true, Validators.required],
    });
    createdItem.controls.name.disable();
    const newEmployee = this.form.get(`membersArray.${index}.employeesArray`) as FormArray;
    newEmployee.push(createdItem);
  }

  createMember() {
    const currentControl = this.form.get('membersArray') as FormArray;
    const newMember = this.initSection();
    currentControl.push(newMember);
  }

  removeItem(index: number, member: number) {
    const control = this.form.get(`membersArray.${member}.employeesArray`) as FormArray;
    control.removeAt(index);
  }

  clearForm(index?: number) {
    const currentControl = this.form.get('membersArray') as FormArray;
    if (index) {
      this.currentMember.splice(index - 1, 1);
      this.employeesList.splice(index - 1, 1);

      index === 1 && currentControl.controls.length === 1
        ? currentControl.clear()
        : currentControl.removeAt(index - 1);
    } else {
      currentControl.clear();
      this.currentMember = [];
      this.employeesList = [];
    }
  }

  createSelectedMemberList(item, index) {
    const selected = {
      id: this.currentMember[index].id,
      employees: [],
    };

    item.employeesArray.forEach(element => {
      selected.employees.push({
        id: element.id,
        reasonid: Number(element.rewardReasons),
        success: element.confirm,
      });
    });

    return selected;
  }

  saveFormData() {
    this.error = undefined;
    this.loading = true;
    const selectedData = {
      members: [],
    };

    const formState = this.form.getRawValue().membersArray;
    formState.forEach((element, index) => {
      selectedData.members.push(this.createSelectedMemberList(element, index));
    });
    this.adminApi.issueTokens(selectedData).subscribe(
      () => {
        this.loading = false;
        this.clearForm();
      },
      error => {
        this.loading = false;
        this.error = error.message;
        console.log(error);
      }
    );
  }
}
