import { Component } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { normalizeError } from '@eea/core/app.errors';
import { MemberApiService } from '../api/member-api.service';

@Component({
  selector: 'eea-redeem-tab',
  templateUrl: './redeem-tab.component.html',
  styleUrls: ['./redeem-tab.component.scss'],
})
export class RedeemTabComponent {
  loading: boolean;

  error: string;

  constructor(private memberApi: MemberApiService) {}

  sendForm($event) {
    this.loading = true;
    const data = { redeemforid: $event.id, redeemforcount: $event.count };
    this.memberApi
      .redeemToken(data)
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
