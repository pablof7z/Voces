<script lang="ts">
  import { Avatar } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/ndk.svelte';
  import QRCode from './wallet/QRCode.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    pubkey: string;
    npub: string;
  }

  let { isOpen = $bindable(), onClose, pubkey, npub }: Props = $props();

  const profile = ndk.$fetchProfile(() => pubkey);

  let copiedUrl = $state(false);
  let copiedNpub = $state(false);

  const profileUrl = `https://njump.me/${npub}`;
  const shareMessage = $derived(`Find me on Nostr: ${profileUrl}`);

  async function copyToClipboard(text: string, type: 'url' | 'npub') {
    await navigator.clipboard.writeText(text);
    if (type === 'url') {
      copiedUrl = true;
      setTimeout(() => copiedUrl = false, 2000);
    } else {
      copiedNpub = true;
      setTimeout(() => copiedNpub = false, 2000);
    }
  }

  function shareOnPlatform(platform: 'whatsapp' | 'twitter' | 'telegram' | 'facebook') {
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(profileUrl);

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent('Find me on Nostr')}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    };

    window.open(urls[platform], '_blank');
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || 'Anonymous'} on Nostr`,
          text: 'Find me on Nostr',
          url: profileUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  }
</script>

<Dialog.Root open={isOpen} onOpenChange={(newOpen) => {
    isOpen = newOpen;
    if (!newOpen) onClose();
  }}>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <Dialog.Title>Share Profile</Dialog.Title>
    </Dialog.Header>

    <div class="space-y-4">

        <div class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 mb-6">
          <div class="flex flex-col items-center text-foreground">
            <div class="relative mb-4">
              <Avatar {ndk} {pubkey} class="w-20 h-20 ring-4 ring-white/20" />
            </div>
            <h3 class="text-xl font-bold mb-1">{profile?.name || 'Anonymous'}</h3>
            {#if profile?.nip05}
              <p class="text-foreground/80 text-sm">@{profile.nip05.split('@')[0]}</p>
            {/if}
          </div>
        </div>

        <div class="flex justify-center mb-6">
          <QRCode value={profileUrl} size={200} />
        </div>

        <div class="space-y-3">
          <Button
            variant="outline"
            onclick={() => copyToClipboard(profileUrl, 'url')}
            class="w-full justify-between"
          >
            <span class="text-sm font-medium">njump.me/{npub.slice(0, 8)}...</span>
            {#if copiedUrl}
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            {/if}
          </Button>

          <Button
            variant="outline"
            onclick={() => copyToClipboard(npub, 'npub')}
            class="w-full justify-between"
          >
            <span class="text-sm font-medium">Copy npub</span>
            {#if copiedNpub}
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            {/if}
          </Button>
        </div>

        <div class="space-y-2">
          <p class="text-sm text-muted-foreground">Share on:</p>
          <div class="grid grid-cols-2 gap-3">
            <Button
              onclick={() => shareOnPlatform('whatsapp')}
              class="bg-green-500 hover:bg-green-600 text-white dark:text-white"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </Button>

            <Button
              variant="outline"
              onclick={() => shareOnPlatform('twitter')}
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </Button>

            <Button
              onclick={() => shareOnPlatform('telegram')}
              class="bg-blue-500 hover:bg-blue-600 text-white dark:text-white"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </Button>

            <Button
              onclick={() => shareOnPlatform('facebook')}
              class="bg-blue-600 hover:bg-blue-700 text-white dark:text-white"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div>

          {#if typeof navigator !== 'undefined' && navigator.share}
            <Button
              onclick={handleNativeShare}
              class="w-full mt-3"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              More Options
            </Button>
          {/if}
        </div>
      </div>
  </Dialog.Content>
</Dialog.Root>
