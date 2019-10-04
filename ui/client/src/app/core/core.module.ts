import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './auth/components/login/login.component';
import { HTTP_INTERCEPTOR_PROVIDERS } from './http-interceptors';
import { CustomRouteReuseStrategy } from './route-reuse.strategy';

@NgModule({
  imports: [HttpClientModule, SharedModule],
  declarations: [LoginComponent],
  providers: [
    HTTP_INTERCEPTOR_PROVIDERS,
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
  ]
})
export class CoreModule {}
