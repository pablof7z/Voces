interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

class ToastStore {
  messages = $state<ToastMessage[]>([]);

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private show(message: string, type: ToastMessage['type'], duration = 3000) {
    const id = this.generateId();
    const toast: ToastMessage = { id, message, type, duration };

    this.messages = [...this.messages, toast];

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  success(message: string, duration?: number) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    return this.show(message, 'info', duration);
  }

  dismiss(id: string) {
    this.messages = this.messages.filter(t => t.id !== id);
  }
}

export const toast = new ToastStore();
