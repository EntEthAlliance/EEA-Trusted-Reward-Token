import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface User {
  login: string;
  pwd: string;
  name: string;
  role: string;
  _id: number;
}

const USER_KEY = 'eea-user';
const USER_TOKEN = 'eea-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$ = new BehaviorSubject<User>(null);

  get user() {
    return this.user$.value;
  }

  get token(): string | null {
    return localStorage.getItem(USER_TOKEN);
  }

  set token(value) {
    localStorage.setItem(USER_TOKEN, value);
  }

  constructor(private router: Router, private http: HttpClient) {
    this.tryToInitUser();
  }

  tryToInitUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      const user = JSON.parse(userStr);
      this.authenticate(user);
    }
  }

  isInRole(role: string) {
    return this.user && this.user.role === role;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }

  login(user: Partial<User>) {
    return this.http.post<User>('/login', user, {observe: 'response'}).pipe(
      tap(res => {
        this.token = res.headers.get('x-auth-token');
        this.authenticate(res.body);
      }),
      map(res => res.body)
    );
  }

  authenticate(user: User) {
    this.user$.next(user);
    localStorage.setItem(USER_KEY, JSON.stringify(this.user));
  }

  logout() {
    this.user$.next(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_TOKEN);
    this.router.navigateByUrl('/login');
  }
}
