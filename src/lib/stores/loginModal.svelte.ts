import { createModalStore } from './modalFactory.svelte';

type LoginState = 'signup' | 'login';

const baseModal = createModalStore<LoginState>();

export const loginModal = {
  get show() {
    return baseModal.show;
  },
  get state() {
    return baseModal.data || 'signup';
  },
  open(openState: LoginState = 'signup') {
    baseModal.open(openState);
  },
  close() {
    baseModal.close();
  },
  setState(newState: LoginState) {
    baseModal.open(newState);
  }
};
