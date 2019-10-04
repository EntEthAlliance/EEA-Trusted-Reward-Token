import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaskModule } from 'ngx-mask';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { LOCALE_ID } from '@angular/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NoopAnimationsModule, CoreModule, AppRoutingModule, NgxMaskModule.forRoot()],
  bootstrap: [AppComponent],
  providers: [{ provide: LOCALE_ID, useValue: 'en-US' }],
})
export class AppModule {
  constructor() {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      loader.parentNode.removeChild(loader);
    }, 3000);
  }
}
