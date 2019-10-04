import { Component } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { MemberApiService } from '../api/member-api.service';
import { normalizeError } from '@eea/core/app.errors';

@Component({
  selector: 'eea-share-tab',
  templateUrl: './share-tab.component.html',
  styleUrls: ['./share-tab.component.scss'],
})
export class ShareTabComponent {
  loading: boolean;

  error: string;

  constructor(private memberApi: MemberApiService) {}

  sendForm($event) {
    this.loading = true;
    const data = { sharetoid: $event.id, tokencount: $event.count };
    this.memberApi
      .shareToken(data)
      .pipe(
        catchError(err => {
          this.error = normalizeError(err);
          return throwError(err);
        })
      )
      .subscribe(() => (this.loading = false));
  }

  clearErrorState() {
    if (this.error) {
      this.error = undefined;
    }
  }
}
