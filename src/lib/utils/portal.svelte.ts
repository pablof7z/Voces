import { mount, unmount } from 'svelte';

export function portal(node: HTMLElement, targetSelector: string = 'body') {
  const target = document.querySelector(targetSelector) || document.body;
  target.appendChild(node);

  return {
    destroy() {
      if (node.parentNode === target) {
        target.removeChild(node);
      }
    }
  };
}
