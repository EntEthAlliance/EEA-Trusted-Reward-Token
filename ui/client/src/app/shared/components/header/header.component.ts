import { Component } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'eea-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  userMenuOpened = false;

  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
