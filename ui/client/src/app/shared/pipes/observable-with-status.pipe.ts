import { Pipe, PipeTransform } from '@angular/core';
import { isObservable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';
import { normalizeError } from '@eea/core/app.errors';

@Pipe({
  name: 'withStatus',
})
export class ObservableWithStatusPipe implements PipeTransform {
  transform(val) {
    return isObservable(val)
      ? val.pipe(
        map((value: any) => ({
          loading: value.type === 'start',
          error: value.type === 'error',
          value: value.type ? value.value : value })
        ),
        startWith({ loading: true }),
        catchError(err => of({ loading: false, error: normalizeError(err) }))
      )
      : val;
  }
}
