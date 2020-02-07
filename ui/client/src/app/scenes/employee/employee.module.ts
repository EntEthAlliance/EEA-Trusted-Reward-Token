import { NgModule } from '@angular/core';

import { SharedModule } from '@eea/shared/shared.module';
import { EmployeeRoutingModule } from './employee-routing.module';
import { SceneSharedModule } from '../shared/scene-shared.module';

@NgModule({
  imports: [EmployeeRoutingModule, SharedModule, SceneSharedModule],
})
export class EmployeeModule {}
