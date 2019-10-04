import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '@eea/core/auth/auth.service';

@Directive({
  // tslint:disable-next-line
  selector: '[ifInRole]',
})
export class UserRoleDirective {
  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input('ifInRole')
  set role(val: string) {
    val && val === this.authService.user.role
      ? this.viewContainer.createEmbeddedView(this.templateRef)
      : this.viewContainer.clear();
  }
}
