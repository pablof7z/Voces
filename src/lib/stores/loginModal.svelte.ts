let showModal = $state(false);
let modalState = $state<'signup' | 'login'>('signup');

export const loginModal = {
  get show() { return showModal; },
  get state() { return modalState; },
  open(state: 'signup' | 'login' = 'signup') {
    modalState = state;
    showModal = true;
  },
  close() {
    showModal = false;
  },
  setState(state: 'signup' | 'login') {
    modalState = state;
  }
};
