import { Component } from '@angular/core';
import { map } from 'rxjs/operators';

import { sortData, TableColumn, TableDataSource, TableLoadParams } from '@eea/table';
import { MemberApiService } from '../api/member-api.service';

@Component({
  selector: 'eea-requests-tab',
  templateUrl: './requests-tab.component.html',
  styleUrls: ['./requests-tab.component.scss'],
})
export class RequestsTabComponent {
  columns: TableColumn[] = [
    {
      key: 'type',
      header: 'Request Type',
    },
    {
      key: 'date',
      header: 'Request Date',
      template: 'date',
    },
    {
      key: 'status',
    },
    {
      header: 'Token count',
      key: 'tokencount',
    },
  ];

  tableDataSource = new TableDataSource((params: TableLoadParams) =>
    this.memberApi.getRequestsList().pipe(map(arr => sortData(arr, params.sort)))
  );

  constructor(private memberApi: MemberApiService) {}
}
