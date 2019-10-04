import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[eeaTemplate]'
})
export class TemplateDirective {
  // tslint:disable-next-line
  @Input('eeaTemplate') name: string;

  constructor(public template: TemplateRef<any>) {}
}
