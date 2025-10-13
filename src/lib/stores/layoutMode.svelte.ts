/**
 * Store to control layout behavior for different content types
 */
class LayoutModeStore {
  private _mode = $state<'default' | 'article' | 'profile' | 'reads'>('default');

  get mode() {
    return this._mode;
  }

  setArticleMode() {
    this._mode = 'article';
  }

  setProfileMode() {
    this._mode = 'profile';
  }

  setReadsMode() {
    this._mode = 'reads';
  }

  setDefaultMode() {
    this._mode = 'default';
  }

  reset() {
    this._mode = 'default';
  }
}

export const layoutMode = new LayoutModeStore();
