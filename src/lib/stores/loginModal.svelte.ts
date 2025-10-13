class LoginModalStore {
  show = $state(false);
  state = $state<'signup' | 'login'>('signup');

  open(openState: 'signup' | 'login' = 'signup') {
    this.state = openState;
    this.show = true;
  }

  close() {
    this.show = false;
  }

  setState(newState: 'signup' | 'login') {
    this.state = newState;
  }
}

export const loginModal = new LoginModalStore();
