import { NgModule } from '@angular/core';
import { SharedModule } from '@eea/shared/shared.module';

import { EmployeesTabComponent } from './tabs/employees-tab/employees-tab.component';
import { MemberOrgsTabComponent } from './tabs/member-orgs-tab/member-orgs-tab.component';
import { TokenOverviewTabComponent } from './tabs/token-overview-tab/token-overview-tab.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';

@NgModule({
  imports: [SharedModule],
  entryComponents: [RegisterFormComponent],
  declarations: [EmployeesTabComponent, MemberOrgsTabComponent, TokenOverviewTabComponent, RegisterFormComponent],
})
export class SceneSharedModule {}
