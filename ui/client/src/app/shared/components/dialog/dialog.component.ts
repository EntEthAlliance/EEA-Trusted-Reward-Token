import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'eea-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  @ViewChild('contentRef', { static: true, read: ViewContainerRef }) contentRef: ViewContainerRef;

  componentRef: ComponentRef<any>;
  submitted: boolean;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private resolver: ComponentFactoryResolver
  ) {}

  ngOnInit() {
    const factory = this.resolver.resolveComponentFactory(this.data.component);
    this.componentRef = this.contentRef.createComponent(factory);

    Object.keys(this.data.inputs || {}).forEach(key => {
      this.componentRef.instance[key] = this.data.inputs[key];
    });
  }

  closeClick(): void {
    this.dialogRef.close(this.submitted);
  }
}
