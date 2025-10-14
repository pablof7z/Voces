import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { createModalStore } from './modalFactory.svelte';

export const createPackModal = createModalStore<NDKEvent>();
