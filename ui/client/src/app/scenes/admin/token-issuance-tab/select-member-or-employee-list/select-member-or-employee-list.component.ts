import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'eea-select-member-or-employee-list',
  templateUrl: './select-member-or-employee-list.component.html',
  styleUrls: ['./select-member-or-employee-list.component.scss'],
})
export class SelectMemberOrEmployeeListComponent {
  list: any[];
  type: string;

  emptyModalDate = {
    member: { text: 'EEA Members list is empty', icon: 'building' },
    employee: { text: 'Selected EEA Member has no registered employees', icon: 'user' },
  };

  constructor(public dialogRef: MatDialogRef<any>, private router: Router) {}

  saveItem(item) {
    this.dialogRef.close(item);
  }

  registrationCall() {
    this.dialogRef.close();
    this.router.navigateByUrl('admin/member-orgs');
  }

  get isEmptyList() {
    return this.list && this.list.length === 0;
  }
}
