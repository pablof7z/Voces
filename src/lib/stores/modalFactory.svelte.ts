/**
 * Generic modal store factory to eliminate duplication across modal stores
 */
export function createModalStore<T = void>() {
  let _show = $state(false);
  let _data = $state<T | null>(null);

  return {
    get show() {
      return _show;
    },
    set show(value: boolean) {
      _show = value;
    },
    get data() {
      return _data;
    },
    set data(value: T | null) {
      _data = value;
    },
    open(payload?: T) {
      _data = (payload ?? null) as T | null;
      _show = true;
    },
    close() {
      _show = false;
      _data = null;
    }
  };
}
