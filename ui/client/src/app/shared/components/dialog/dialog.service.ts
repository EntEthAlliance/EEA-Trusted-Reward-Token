import { Injectable, Type } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

interface DialogConfig<T> extends MatDialogConfig {
  title: string;
  data: Partial<{ [property in keyof T]: any }>;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  open<T>(component: Type<T>, config: DialogConfig<T>) {
    return this.dialog.open(DialogComponent, {
      ...config,
      disableClose: true,
      data: {
        dialogTitle: config.title,
        component,
        inputs: config.data
      },
    });
  }
}
