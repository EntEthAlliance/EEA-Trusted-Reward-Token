import { DataSource } from '@angular/cdk/collections';
import { MatSort, Sort } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, merge, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize, switchMap, takeUntil } from 'rxjs/operators';

interface Filter {
  [key: string]: any;
}

export interface TableLoadParams {
  filter: Filter;
  sort: Sort;
  pageNumber: number;
  pageSize: number;
}

export type TableLoadFn = (params: TableLoadParams) => Observable<any[]>;

export class TableDataSource<T> implements DataSource<T> {
  loading$ = new BehaviorSubject<boolean>(false);

  set filter(value: Filter) {
    this.filter$.next(value);
  }

  length: number;

  private _sort: MatSort | null;

  get sort(): MatSort | null {
    return this._sort;
  }
  set sort(sort: MatSort | null) {
    this._sort = sort;
    this.updateChangeSubscription();
  }

  private data$ = new BehaviorSubject<T[]>([]);

  private filter$ = new BehaviorSubject<Filter>({});

  private refreshTrigger$ = new BehaviorSubject({});

  private destroyed$ = new Subject();

  private changesSubscription = Subscription.EMPTY;

  get data(): T[] {
    return this.data$.value;
  }

  constructor(private loadFn: TableLoadFn) {
    this.updateChangeSubscription();
  }

  connect(): Observable<T[]> {
    return this.data$.asObservable();
  }

  disconnect(): void {
    this.data$.complete();
    this.loading$.complete();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  refresh() {
    this.refreshTrigger$.next({});
  }

  updateChangeSubscription() {
    const sortChange$: Observable<Sort | null> = this._sort
      ? (merge(this._sort.sortChange, this._sort.initialized) as Observable<Sort>)
      : of(null);

    this.changesSubscription.unsubscribe();
    this.changesSubscription = combineLatest(this.filter$, sortChange$, this.refreshTrigger$)
      .pipe(
        takeUntil(this.destroyed$),
        switchMap(([filter, matSort]) => {
          const pageNumber = 0;
          const pageSize = Number.MAX_VALUE;
          const sort = matSort || { active: '', direction: 'asc' };
          this.loading$.next(true);

          return this.loadFn({ filter, sort, pageNumber, pageSize }).pipe(
            catchError(() => of([])),
            finalize(() => this.loading$.next(false))
          );
        })
      )
      .subscribe((data: any[]) => {
        this.length = data.length;
        this.data$.next(data);
      });
  }
}

export function sortData(data: any[], sort: Sort) {
  if (!sort.active || sort.direction === '') {
    return data;
  }

  return data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';

    const leftOperand = typeof a[sort.active] === 'string' ? a[sort.active].toLowerCase() : a[sort.active];
    const rightOperand = typeof b[sort.active] === 'string' ? b[sort.active].toLowerCase() : b[sort.active];

    return compare(leftOperand, rightOperand, isAsc);
  });
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
