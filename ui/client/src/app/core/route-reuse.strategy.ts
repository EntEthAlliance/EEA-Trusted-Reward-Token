import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  storedRouteHandles = new Map<string, DetachedRouteHandle>();

  // Decides if the route should be stored
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data.shouldReuse;
  }

  // Store the information for the route we're destructing
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.storedRouteHandles.set(getRouteKey(route), handle);
  }

  // Return true if we have a stored route object for the next route
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (route.routeConfig.path === 'login') {
      this.clearCache();
    }

    return this.storedRouteHandles.has(getRouteKey(route));
  }

  // If we returned true in shouldAttach(), now return the actual route data for restoration
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.storedRouteHandles.get(getRouteKey(route));
  }

  // Reuse the route if we're going to and from the same route
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  clearCache() {
    for (const handle of this.storedRouteHandles.values()) {
      if (handle['componentRef']) {
        handle['componentRef'].destroy();
      }
    }

    this.storedRouteHandles.clear();
  }
}

function getRouteKey(route: ActivatedRouteSnapshot): string {
  let next = route;
  // Since navigation is usually relative
  // we go down to find out the child to be shown.
  while (next.firstChild) {
    next = next.firstChild;
  }
  const segments = [];
  // Then build a unique key-path by going to the root.
  while (next) {
    segments.push(next.url.join('/'));
    next = next.parent;
  }
  return segments.reverse().join('/');
}
