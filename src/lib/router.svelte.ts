interface Route {
  path: string;
  params?: Record<string, string>;
}

class Router {
  private currentRoute = $state<Route>({ path: '/' });

  get path() {
    return this.currentRoute.path;
  }

  get params() {
    return this.currentRoute.params || {};
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.updateFromLocation();

      window.addEventListener('popstate', () => {
        this.updateFromLocation();
      });

      window.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');

        if (
          anchor &&
          anchor.href &&
          anchor.href.startsWith(window.location.origin) &&
          !anchor.target &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey &&
          !anchor.hasAttribute('data-external')
        ) {
          e.preventDefault();
          const url = new URL(anchor.href);
          this.push(url.pathname);
        }
      });
    }
  }

  private updateFromLocation() {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname;
    const params = this.extractParams(path);

    this.currentRoute = { path, params };
  }

  private extractParams(path: string): Record<string, string> {
    const params: Record<string, string> = {};
    const parts = path.split('/').filter(Boolean);

    if (parts[0] === 'p' && parts[1]) {
      params.identifier = parts[1];
    }

    if (parts[0] === 'e' && parts[1]) {
      params.nevent = parts[1];
    }

    if (parts[0] === 'article' && parts[1]) {
      params.naddr = parts[1];
    }

    if (parts[0] === 'messages' && parts[1]) {
      params.pubkey = parts[1];
    }

    if (parts[0] === 'packs' && parts[1]) {
      params.packId = parts[1];
    }

    if (parts[0] === 'marketplace' && parts[1]) {
      params.id = parts[1];
    }

    if (parts[0] === 'i' && parts[1]) {
      params.code = parts[1];
    }

    return params;
  }

  push(path: string) {
    if (typeof window === 'undefined') return;

    window.history.pushState(null, '', path);
    this.updateFromLocation();
  }

  replace(path: string) {
    if (typeof window === 'undefined') return;

    window.history.replaceState(null, '', path);
    this.updateFromLocation();
  }

  back() {
    if (typeof window === 'undefined') return;

    window.history.back();
  }

  matches(pattern: string): boolean {
    const path = this.currentRoute.path;

    if (pattern === path) return true;

    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return false;

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) continue;

      if (patternPart !== pathPart) return false;
    }

    return true;
  }
}

export const router = new Router();
