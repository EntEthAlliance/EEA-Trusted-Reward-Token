import { Component, Inject, OnDestroy } from '@angular/core';
import { Route, Router, NavigationEnd } from '@angular/router';

export interface Tab {
  name: string;
  icon: string;
  active?: boolean;
}

@Component({
  selector: 'eea-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnDestroy {
  topMenuActive: Tab;
  sideMenuActive: Tab;
  mainMenuActive: Tab;
  private subscription: any;

  fullPageMenu = {
    topMenu: false,
    sideMenu: false,
    mainMenu: false,
  };

  navItems: Tab[] = [
    {
      name: 'Overview',
      icon: 'star',
    },
    {
      name: 'Account',
      icon: 'edit',
      active: true,
    },
    {
      name: 'Organizations',
      icon: 'building',
    },
    {
      name: 'Purchases',
      icon: 'shopping-cart',
    },
  ];

  sideMenu: Tab[] = [
    {
      name: 'Personal info',
      icon: 'user',
    },
    {
      name: 'Contact info',
      icon: 'envelope',
    },
    {
      name: 'Speaker info',
      icon: 'microphone',
    },
    {
      name: 'Change password',
      icon: 'lock',
    },
    {
      name: 'Privacy',
      icon: 'lock',
    },
    {
      name: 'EEA tokens',
      icon: 'coins',
      active: true,
    },
  ];

  constructor(
    @Inject('RoutesConfig') public routesConfig: { basePath: string; routes: Route[] },
    private router: Router
  ) {
    this.topMenuActive = this.getSelectedTab(this.navItems, 'active');
    this.sideMenuActive = this.getSelectedTab(this.sideMenu, 'active');

    this.subscription = this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        const url = val.urlAfterRedirects;
        this.mainMenuActive = this.getSelectedTab(this.routesConfig.routes, 'path', url);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getSelectedTab(tabs: any, val: string, selector?: string) {
    const currentActiveTab = tabs.findIndex(el => {
      if (selector) {
        return `${this.routesConfig.basePath}${el[val] ? `/${el[val]}` : ''}` === selector;
      } else {
        return !!el[val];
      }
    });

    return selector ? tabs[currentActiveTab].data : tabs[currentActiveTab];
  }

  toggleTab(item: string) {
    this.fullPageMenu[item] = !this.fullPageMenu[item];
  }
}
