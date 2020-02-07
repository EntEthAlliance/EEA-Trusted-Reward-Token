import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ContentChildren,
  QueryList,
  AfterContentInit,
  TemplateRef,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TemplateDirective } from '../../directives/template.directive';
import { TableDataSource } from './table.datasource';
import { TableColumn } from './table.types';

@Component({
  selector: 'eea-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements AfterContentInit, OnInit, OnDestroy {
  @Input() dataSource: TableDataSource<any>;

  @Input() columns: TableColumn[];

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ContentChildren(TemplateDirective) templates: QueryList<TemplateDirective>;

  displayedColumns: string[];

  templatesMap: { [key: string]: TemplateRef<any> } = {};

  private destroyed$ = new Subject();

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.setDisplayedColumns();
    this.observeChanges();
  }

  ngAfterContentInit() {
    this.templatesMap = this.templates.reduce((map, directive) => {
      map[directive.name] = directive.template;
      return map;
    }, {});
  }

  setDisplayedColumns() {
    this.displayedColumns = (this.columns || []).map(column => column.key);
  }

  observeChanges() {
    const dataStream$ = this.dataSource.connect();
    dataStream$.pipe(takeUntil(this.destroyed$)).subscribe(arr => {
      if (!this.columns && arr && arr.length) {
        this.columns = Object.keys(arr[0]).map(key => ({ key }));
        this.setDisplayedColumns();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
