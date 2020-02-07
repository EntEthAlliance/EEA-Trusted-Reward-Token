import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { NgxMaskModule } from 'ngx-mask';

import { HeaderComponent } from './components/header/header.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ButtonComponent } from './components/button/button.component';
import { TableComponent } from './components/table/table.component';

import { DialogComponent } from './components/dialog/dialog.component';

import { ClickOutsideDirective } from './directives/click-outside.directive';
import { UserRoleDirective } from './directives/user-role.directive';
import { SetErrorDirective } from './directives/error-state.directive';
import { TemplateDirective } from './directives/template.directive';

import { ObservableWithStatusPipe } from './pipes/observable-with-status.pipe';
import { ShortNumberPipe } from './pipes/short-type-number.pipe';

import { DialogService } from './components/dialog/dialog.service';

const SHARED_COMPONENTS = [LayoutComponent, ButtonComponent, DialogComponent];

const SHARED_DIRECTIVES = [
  ClickOutsideDirective,
  UserRoleDirective,
  TemplateDirective,
  SetErrorDirective,
];

const SHARED_PIPES = [ObservableWithStatusPipe, ShortNumberPipe];

const SHARED_MODULES = [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  MatDialogModule,
  NgxMaskModule,
];

const DECLARABLES = [SHARED_COMPONENTS, SHARED_DIRECTIVES, SHARED_PIPES];

const EXPORTS = [SHARED_MODULES, ...DECLARABLES];

@NgModule({
  entryComponents: [DialogComponent],
  declarations: [...DECLARABLES, HeaderComponent, ButtonComponent, TableComponent, DialogComponent],
  providers: [DialogService],
  imports: [...SHARED_MODULES, CdkTableModule, MatSortModule],
  exports: [...EXPORTS, TableComponent],
})
export class SharedModule {}
