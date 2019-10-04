import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanLoad {
  constructor(private router: Router, private authService: AuthService) {}

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.authService.isInRole(route.data.role)) {
      const isAuthenticated = this.authService.isAuthenticated();

      this.router.navigate(
        [isAuthenticated ? this.authService.user.role : 'login'],
        isAuthenticated ? {} : { queryParams: { returnUrl: segments.join('/') } }
      );

      return false;
    }

    return true;
  }
}
