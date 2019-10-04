import { NgModule } from '@angular/core';

import { SharedModule } from '@eea/shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { SceneSharedModule } from '../shared/scene-shared.module';

import { TokenIssuanceTabComponent } from './token-issuance-tab/token-issuance-tab.component';
import { RequestsTabComponent } from './requests-tab/requests-tab.component';
import { SelectMemberOrEmployeeListComponent } from './token-issuance-tab/select-member-or-employee-list/select-member-or-employee-list.component';

@NgModule({
  imports: [AdminRoutingModule, SharedModule, SceneSharedModule],
  entryComponents: [SelectMemberOrEmployeeListComponent],
  declarations: [
    TokenIssuanceTabComponent,
    RequestsTabComponent,
    SelectMemberOrEmployeeListComponent,
  ],
})
export class AdminModule {}
