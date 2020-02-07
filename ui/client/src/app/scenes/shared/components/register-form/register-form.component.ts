import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DialogComponent } from '@eea/shared/components/dialog/dialog.component';

import { normalizeError } from '@eea/core/app.errors';

@Component({
  selector: 'eea-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent implements OnInit {
  registerApi: { register: (model: {}) => Observable<any> };

  form: FormGroup;

  isFormSubmitted = false;

  loading = false;

  error: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private dialog: DialogComponent
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = undefined;

    this.registerApi
      .register(this.form.value)
      .pipe(
        catchError(err => {
          this.error = normalizeError(err);
          if (this.error.includes('email')) {
            this.form.controls.email.setErrors({ invalid: true });
          }
          this.loading = false;
          return throwError(err);
        })
      )
      .subscribe(() => {
        this.error = undefined;
        this.isFormSubmitted = true;
        this.loading = false;
        this.dialog.submitted = true;
      });
  }

  closeDialog(result?: boolean): void {
    this.dialogRef.close(result);
  }

  clearValidationErrors() {
    if (this.error || this.form.controls.email.hasError('invalid')) {
      this.error = undefined;
      this.form.controls.email.setErrors(null);
    }
  }
}
