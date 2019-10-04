import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  // tslint:disable-next-line
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {
  constructor(private elRef: ElementRef) {}

  @Output() clickOutside = new EventEmitter();

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target) {
    const clickedInside = this.elRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
