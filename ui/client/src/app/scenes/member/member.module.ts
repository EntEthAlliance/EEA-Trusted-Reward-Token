import { NgModule } from '@angular/core';

import { SharedModule } from '@eea/shared/shared.module';
import { SceneSharedModule } from '../shared/scene-shared.module';
import { MemberRoutingModule } from './member-routing.module';

import { RedeemTabComponent } from './redeem-tab/redeem-tab.component';
import { ShareTabComponent } from './share-tab/share-tab.component';
import { RequestsTabComponent } from './requests-tab/requests-tab.component';
import { TokenCounterFormComponent } from '../shared/components/token-counter-form/token-counter-form.component';

@NgModule({
  imports: [MemberRoutingModule, SharedModule, SceneSharedModule],
  declarations: [
    RedeemTabComponent,
    ShareTabComponent,
    RequestsTabComponent,
    TokenCounterFormComponent,
  ],
})
export class MemberModule {}
