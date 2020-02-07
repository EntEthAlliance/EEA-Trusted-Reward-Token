import { Component, OnInit } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { normalizeError } from '@eea/core/app.errors';
import { sortData, TableColumn, TableDataSource, TableLoadParams } from '@eea/table';
import { AdminApiService } from '../api/admin-api.service';
import { SelectedRequest } from '../models/selected-request.model';

@Component({
  selector: 'eea-requests-tab',
  templateUrl: './requests-tab.component.html',
  styleUrls: ['./requests-tab.component.scss'],
})
export class RequestsTabComponent implements OnInit {
  columns: TableColumn[] = [
    {
      key: 'name',
      template: 'name',
      header: 'EEA Member Name',
    },
    {
      key: 'type',
      header: 'Request Type',
    },
    {
      key: 'date',
      template: 'date',
      header: 'Request Date',
    },
  ];

  tableDataSource;

  isSelected = false;

  loading = {
    cancel: false,
    approve: false,
  };

  selectedRequest: SelectedRequest;

  error: string;

  constructor(private adminApi: AdminApiService) {}

  ngOnInit() {
    this.getTableData();
  }

  getTableData() {
    this.tableDataSource = new TableDataSource((params: TableLoadParams) =>
      this.adminApi.getRequests().pipe(map(arr => sortData(arr, params.sort)))
    );
  }

  onSelect(id) {
    this.adminApi.getRequestById(id).subscribe((data: SelectedRequest) => {
      this.selectedRequest = data;
      this.isSelected = true;
    });
  }

  closeRequest() {
    this.error = undefined;
    this.getTableData();
    this.selectedRequest = undefined;
    this.isSelected = false;
  }

  improveRequest(value: boolean) {
    this.error = undefined;
    value ? (this.loading.approve = true) : (this.loading.cancel = true);
    const requestResult = { requestid: this.selectedRequest.id, iscomplete: value };
    this.adminApi
      .postRedeemRequest(requestResult)
      .pipe(
        catchError(err => {
          this.error = normalizeError(err);
          value ? (this.loading.approve = false) : (this.loading.cancel = false);
          return throwError(err);
        })
      )
      .subscribe(() => {
        value ? (this.loading.approve = false) : (this.loading.cancel = false);
        this.error = undefined;
        this.closeRequest();
      });
  }
}
