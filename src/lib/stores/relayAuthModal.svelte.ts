interface RelayAuthRequest {
  relayUrl: string;
  onConfirm: () => void;
  onReject: () => void;
}

class RelayAuthModalStore {
  private _show = $state(false);
  private _request = $state<RelayAuthRequest | null>(null);

  get show() {
    return this._show;
  }

  get request() {
    return this._request;
  }

  open(request: RelayAuthRequest) {
    this._request = request;
    this._show = true;
  }

  confirm() {
    if (this._request) {
      this._request.onConfirm();
      this.close();
    }
  }

  reject() {
    if (this._request) {
      this._request.onReject();
      this.close();
    }
  }

  close() {
    this._show = false;
    this._request = null;
  }
}

export const relayAuthModal = new RelayAuthModalStore();
