import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  addToken(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.token;
    return token
      ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
      : req;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(this.addToken(req)).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          console.error(err);

          return this.logoutUser();
        }

        return observableThrowError(err);
      })
    );
  }

  logoutUser() {
    this.authService.logout();

    return observableThrowError('');
  }
}
