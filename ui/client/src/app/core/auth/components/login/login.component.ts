import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService, User } from '../../auth.service';
import { normalizeError } from '../../../app.errors';

@Component({
  selector: 'eea-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  error: string;

  loading = false;

  year = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      login: ['', [Validators.required]],
      pwd: ['', Validators.required],
      rememberUser: false,
    });
  }

  signIn() {
    if (!this.form.valid) {
      this.error = 'Incorrect login or password';
      this.setNotValid();
      return;
    }
    const user: User = this.form.value;

    this.error = undefined;
    this.loading = true;

    this.authService
      .login(user)
      .pipe(
        catchError(err => {
          this.setNotValid();
          this.error = normalizeError(err);
          this.loading = false;
          return throwError(err);
        })
      )
      .subscribe(usr => {
        this.error = undefined;
        this.router
          .navigateByUrl(this.route.snapshot.queryParams['returnUrl'] || `/${usr.role}`)
          .then(() => {
            this.loading = false;
          });
      });
  }

  clearValidationErrors() {
    if (
      (this.form.controls.pwd.hasError('invalid') &&
        this.form.controls.login.hasError('invalid')) ||
      this.error
    ) {
      this.error = undefined;
      this.form.controls.login.setErrors(null);
      this.form.controls.pwd.setErrors(null);
    }
  }

  setNotValid() {
    this.form.controls.login.setErrors({ invalid: true });
    this.form.controls.pwd.setErrors({ invalid: true });
  }
}
