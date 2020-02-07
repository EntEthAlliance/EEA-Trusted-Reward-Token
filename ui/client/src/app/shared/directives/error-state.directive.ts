import { Directive, ElementRef, AfterViewChecked } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  // tslint:disable-next-line
  selector: '[formControlName], [formControl]',
})
export class SetErrorDirective implements AfterViewChecked {
  constructor(private control: NgControl, private host: ElementRef<HTMLElement>) {}

  ngAfterViewChecked() {
    if (this.control.hasError('invalid')) {
      this.element.classList.add('input-invalid');
    } else {
      this.element.classList.remove('input-invalid');
    }
  }

  get element() {
    return this.host.nativeElement;
  }
}
