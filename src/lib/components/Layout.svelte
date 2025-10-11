<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ndk } from '$lib/ndk.svelte';
  import { useWallet } from '$lib/utils/useWallet.svelte';
  import { sidebarStore } from '$lib/stores/sidebar.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import { createPackModal } from '$lib/stores/createPackModal.svelte';
  import { createListingModal } from '$lib/stores/createListingModal.svelte';
  import { useRelayInfoCached } from '$lib/utils/relayInfo.svelte';
  import { NDKKind, NDKArticle } from '@nostr-dev-kit/ndk';
  import RelaySelector from './RelaySelector.svelte';
  import LoginButton from './LoginButton.svelte';
  import UserMenu from './UserMenu.svelte';
  import MarketplaceSidebar from './MarketplaceSidebar.svelte';
  import NewMembersWidget from './NewMembersWidget.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  const currentUser = ndk.$currentUser;
  const wallet = useWallet(ndk);
  let sidebarCollapsed = $state(false);

  const path = $derived($page.url.pathname);

  const hideRightSidebar = $derived(
    path.startsWith('/article/') ||
    path.startsWith('/note/') ||
    path.startsWith('/messages/') ||
    path.startsWith('/p/') ||
    path.startsWith('/packs')
  );

  // Subscribe to recent articles for the sidebar
  const recentArticlesSubscription = $derived.by(() => {
    if (!hideRightSidebar && !sidebarStore.rightSidebar) {
      return ndk.$subscribe(() => ({
        filters: [{ kinds: [NDKKind.Article], limit: 5 }],
        bufferMs: 500,
      }));
    }
    return null;
  });

  const recentArticles = $derived.by(() => {
    if (!recentArticlesSubscription) return [];
    return recentArticlesSubscription.events
      .map(e => NDKArticle.from(e))
      .filter(article => article.title && article.content)
      .sort((a, b) => (b.published_at ?? b.created_at ?? 0) - (a.published_at ?? a.created_at ?? 0))
      .slice(0, 5);
  });

  const selectedRelayInfo = $derived.by(() => {
    if (!settings.selectedRelay) return null;
    return useRelayInfoCached(settings.selectedRelay);
  });

  // Auto-collapse sidebar when viewing articles
  $effect(() => {
    if (path.startsWith('/article/')) {
      sidebarCollapsed = true;
    }
  });

  function formatBalance(sats: number): string {
    if (sats === 0) return '0 sats';
    return new Intl.NumberFormat('en-US').format(sats) + ' sats';
  }
</script>

<div class="min-h-screen bg-black flex justify-center overflow-x-hidden">
  <div class="flex w-full max-w-[1400px] relative">
    <!-- Left Sidebar - Navigation -->
    <aside class="hidden lg:flex {sidebarCollapsed ? 'w-20' : 'w-64'} flex-col border-r border-neutral-800/50 p-4 fixed left-0 top-0 bottom-0 overflow-y-auto overflow-x-visible transition-all duration-300 ease-in-out">
      <!-- Header: Logo and Toggle -->
      <div class="mb-6 flex items-center {sidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2">
        <!-- Agora Branding -->
        <div class="px-2 {sidebarCollapsed ? 'hidden' : 'flex-1'} transition-opacity duration-300">
        <svg viewBox="0 0 686 250" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          <style>
            .st0{fill:#F68E1D;}
            .st1{fill:#FFFFFF;}
            .st2{fill:#FDFDFD;}
          </style>
          <path class="st0" d="M109.5,196.1h66.7c17.5,0,31.6-14.2,31.6-31.6V97.8c0-17.5-14.2-31.6-31.6-31.6h-66.7
            c-17.5,0-31.6,14.2-31.6,31.6v66.7C77.9,182,92,196.1,109.5,196.1z"/>
          <g>
            <path class="st1" d="M233.9,165.4v-0.9c3.6-0.3,6.4-1.1,8.4-2.4c2-1.3,3.5-3.2,4.7-5.8l24.2-54.9h3.8l28.5,57.6
              c0.7,1.4,1.7,2.6,3.2,3.6c1.4,1,3.6,1.6,6.4,1.9v0.9h-27.7v-0.9c2.9-0.3,4.7-0.9,5.4-1.9c0.8-1,0.8-2.2,0.1-3.6l-21.5-44.6
              L251,156.3c-1.1,2.6-0.9,4.5,0.5,5.8c1.4,1.3,3.9,2.1,7.6,2.4v0.9H233.9z M273.1,87.7h8.8l-7.8,9.2h-3L273.1,87.7z"/>
            <path class="st1" d="M358.3,135.2c0-1.5-0.6-2.7-1.8-3.7c-1.2-0.9-3.3-1.5-6.1-1.8v-0.9H378v0.9c-2.9,0.3-4.9,0.9-6.1,1.8
              c-1.2,0.9-1.8,2.1-1.8,3.7v32.9c0,1.5,0.6,2.7,1.8,3.7c1.2,0.9,3.3,1.5,6.1,1.8v0.9h-29v-0.9c3.5-0.3,5.9-0.9,7.2-1.8
              c1.3-0.9,2-2.1,2-3.7v-11.1c-1.5,2.9-3.7,5.2-6.7,6.7c-2.9,1.6-6.8,2.3-11.5,2.3c-4.5,0-8.7-0.7-12.3-2.2c-3.7-1.5-6.8-3.6-9.4-6.4
              c-2.6-2.8-4.6-6.2-6-10.2c-1.4-4-2.1-8.6-2.1-13.6c0-5.1,0.7-9.6,2.2-13.7c1.5-4.1,3.7-7.5,6.6-10.4c2.9-2.9,6.5-5.1,10.9-6.7
              c4.4-1.6,9.4-2.3,15.1-2.3c3.8,0,7.5,0.3,11.2,1c3.7,0.7,7.2,1.7,10.6,3v15.6h-1.3c-1.1-2.5-2.3-4.8-3.7-6.8c-1.4-2-3-3.8-4.7-5.3
              c-1.8-1.5-3.7-2.6-5.9-3.4c-2.2-0.8-4.6-1.2-7.3-1.2c-3.6,0-6.8,0.7-9.5,2.1c-2.7,1.4-4.9,3.4-6.7,6c-1.8,2.6-3.2,5.7-4,9.3
              c-0.9,3.6-1.3,7.7-1.3,12.2c0,9.2,1.8,16.2,5.5,20.8c3.7,4.7,8.6,7,14.6,7c4.8,0,8.5-1.6,11.3-4.8c2.7-3.2,4.2-8.5,4.5-15.8V135.2z
              "/>
            <path class="st1" d="M480.2,101.4c12.3,0,21.4,1.4,27.3,4.3c5.8,2.9,8.8,6.9,8.8,12.1c0,3.8-1.6,7.1-4.7,9.7
              c-3.2,2.6-8,4.5-14.7,5.6l19,25.9c0.9,1.3,2.2,2.4,3.8,3.5c1.6,1,3.8,1.7,6.7,2v0.9h-27.7v-0.9c2.9-0.3,4.5-1,4.8-2
              c0.3-1,0-2.2-0.9-3.5l-17.9-24.8c-0.7,0.1-1.4,0.1-2.1,0.1c-0.8,0-1.5,0-2.3,0h-7.1V159c0,1.5,0.6,2.7,1.8,3.7
              c1.2,0.9,3.3,1.5,6.1,1.8v0.9h-27.7v-0.9c2.9-0.3,4.9-0.9,6.1-1.8c1.2-0.9,1.8-2.1,1.8-3.7v-51.2c0-1.5-0.6-2.7-1.8-3.7
              c-1.2-0.9-3.3-1.5-6.1-1.8v-0.9H480.2z M480.2,131.6c8.2,0,14.3-1.2,18.1-3.5c3.8-2.3,5.7-5.7,5.7-10.2c0-4.5-1.9-7.9-5.7-10.2
              c-3.8-2.3-9.8-3.5-18.1-3.5h-7.1v27.5H480.2z"/>
            <path class="st1" d="M528.9,165.4v-0.9c3.6-0.3,6.4-1.1,8.4-2.4c2-1.3,3.5-3.2,4.7-5.8l24.2-54.9h3.8l28.5,57.6
              c0.7,1.4,1.7,2.6,3.2,3.6c1.4,1,3.6,1.6,6.4,1.9v0.9h-27.7v-0.9c2.9-0.3,4.7-0.9,5.4-1.9c0.8-1,0.8-2.2,0.1-3.6l-21.5-44.6
              L546,156.3c-1.1,2.6-0.9,4.5,0.5,5.8c1.4,1.3,3.9,2.1,7.6,2.4v0.9H528.9z"/>
            <path class="st1" d="M445.1,120c-1.5-4-3.7-7.5-6.5-10.3c-2.8-2.9-6.2-5.1-10.1-6.6c-4-1.6-8.4-2.3-13.4-2.3
              c-4.9,0-9.3,0.8-13.3,2.3c-4,1.6-7.4,3.8-10.2,6.6c-2.8,2.9-5,6.3-6.5,10.3c-1.5,4-2.3,8.5-2.3,13.5s0.8,9.4,2.3,13.5
              c1.5,4,3.7,7.5,6.5,10.3c2.8,2.9,6.2,5.1,10.2,6.6c4,1.6,8.4,2.3,13.3,2.3c5,0,9.4-0.8,13.4-2.3c3.9-1.6,7.3-3.8,10.1-6.6
              c2.8-2.9,5-6.3,6.5-10.3c1.5-4,2.3-8.5,2.3-13.5S446.6,124,445.1,120z M415,163.4c-12.4,0-20.9-13.4-20.9-30s8.2-30,20.9-30
              c13,0,20.9,13.4,20.9,30S428,163.4,415,163.4z"/>
          </g>
          <path d="M144.2,133.4h-2.9v0.1C142.3,133.5,143.3,133.5,144.2,133.4z"/>
          <polygon class="st2" points="143.9,97.2 101,109.3 101,113.8 186.8,113.8 186.8,109.3 "/>
          <polygon class="st2" points="104.4,115.4 106,117.6 181.2,117.6 182.6,115.4 "/>
          <path class="st2" d="M125,120.4h-11.8h-0.8h-11.8l-1.5,1.8l6.4,4.6h0.1v34.7h14.6v-34.7h0.1l6.4-4.6L125,120.4z M111.2,157h-2.6
            v-29.2h2.6V157z M117.1,157h-2.6v-29.2h2.6V157z"/>
          <path class="st2" d="M185.3,120.4h-11.8h-0.8h-11.8l-1.5,1.8l6.4,4.6h0.1v34.7h14.6v-34.7h0.1l6.4-4.6L185.3,120.4z M171.4,157h-2.6
            v-29.2h2.6V157z M177.3,157h-2.6v-29.2h2.6V157z"/>
          <path class="st2" d="M155.2,120.4h-11.8h-0.8h-11.8l-1.5,1.8l6.4,4.6h0.1v34.7h14.6v-34.7h0.1l6.4-4.6L155.2,120.4z M141.3,157h-2.6
            v-29.2h2.6V157z M147.2,157h-2.6v-29.2h2.6V157z"/>
          <path class="st1" d="M284.4,150.2h-2.6v0.1C282.7,150.3,283.6,150.3,284.4,150.2z"/>
        </svg>
        </div>

        <!-- Toggle Button -->
        <button
          onclick={() => sidebarCollapsed = !sidebarCollapsed}
          class="p-2 rounded-lg hover:bg-neutral-800/50 transition-colors text-neutral-400 hover:text-orange-500 flex-shrink-0"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {#if sidebarCollapsed}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          {/if}
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-2">
        <!-- Following / Relay Selector -->
        <RelaySelector active={path === '/'} collapsed={sidebarCollapsed} />

        <a
          href="/messages"
          class="flex items-center {sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-lg transition-colors {path.startsWith('/messages') ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
          title={sidebarCollapsed ? 'Messages' : undefined}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {#if !sidebarCollapsed}
            <span class="font-medium">Messages</span>
          {/if}
        </a>


        <a
          href="/packs"
          class="flex items-center {sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-lg transition-colors {path.startsWith('/packs') ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
          title={sidebarCollapsed ? 'Follow Packs' : undefined}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {#if !sidebarCollapsed}
            <span class="font-medium">Follow Packs</span>
          {/if}
        </a>

        <a
          href="/wallet"
          class="flex items-center {sidebarCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'} rounded-lg transition-colors {path === '/wallet' ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
          title={sidebarCollapsed ? 'Wallet' : undefined}
        >
          <div class="flex items-center {sidebarCollapsed ? '' : 'gap-3'}">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
            {#if !sidebarCollapsed}
              <span class="font-medium">Wallet</span>
            {/if}
          </div>
          {#if !sidebarCollapsed}
            <span class="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-500 font-medium">{formatBalance(wallet.balance)}</span>
          {/if}
        </a>

        <a
          href="/trades"
          class="flex items-center {sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-lg transition-colors {path === '/trades' ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
          title={sidebarCollapsed ? 'P2P Trades' : undefined}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          {#if !sidebarCollapsed}
            <span class="font-medium">P2P Trades</span>
          {/if}
        </a>

        <a
          href="/marketplace"
          class="flex items-center {sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-lg transition-colors {path === '/marketplace' ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
          title={sidebarCollapsed ? 'Marketplace' : undefined}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {#if !sidebarCollapsed}
            <span class="font-medium">Marketplace</span>
          {/if}
        </a>

        <button
          onclick={() => {
            if (path === '/marketplace') {
              createListingModal.open();
            } else if (path === '/trades') {
              goto('/trades/create');
            } else if (path.startsWith('/packs')) {
              createPackModal.open();
            } else {
              goto('/compose');
            }
          }}
          class="w-full flex items-center justify-center {sidebarCollapsed ? 'p-3' : 'gap-2 px-6 py-3'} bg-orange-500 hover:bg-orange-500/90 text-white font-semibold rounded-full transition-colors mt-4"
          title={sidebarCollapsed ? (path === '/marketplace' ? 'Create Listing' : path === '/trades' ? 'Create Trade' : path.startsWith('/packs') ? 'Create Pack' : 'Compose') : undefined}
        >
          {#if path === '/marketplace'}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {#if !sidebarCollapsed}
              <span>Create Listing</span>
            {/if}
          {:else if path === '/trades'}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {#if !sidebarCollapsed}
              <span>Create Trade</span>
            {/if}
          {:else if path.startsWith('/packs')}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {#if !sidebarCollapsed}
              <span>Create Pack</span>
            {/if}
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {#if !sidebarCollapsed}
              <span>Compose</span>
            {/if}
          {/if}
        </button>
      </nav>

      <!-- Login/User Section -->
      <div class="mt-auto pt-4 border-t border-neutral-800/50">
        {#if currentUser}
          <UserMenu collapsed={sidebarCollapsed} />
        {:else}
          <LoginButton class="w-full flex items-center justify-center {sidebarCollapsed ? 'p-3' : 'gap-2 px-4 py-3'} bg-white hover:bg-neutral-100 text-black font-semibold rounded-full transition-colors" />
        {/if}
      </div>
    </aside>

    <!-- Main Content Container -->
    <div class="flex-1 flex {sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} transition-all duration-300 ease-in-out">
      <!-- Center column - Main content -->
      <div class={`flex-1 ${hideRightSidebar ? 'max-w-[900px]' : 'max-w-[600px]'} flex flex-col min-h-screen border-x border-neutral-800/50`}>
        <!-- Page content -->
        <main class="flex-1 pb-20 md:pb-0 bg-black">
          {@render children()}
        </main>
      </div>

      <!-- Right Sidebar - Widgets -->
      {#if !hideRightSidebar}
        <aside class="hidden lg:block w-80 p-4 space-y-4">
          <div class="sticky top-4 space-y-4">
            {#if sidebarStore.rightSidebar}
              {@render sidebarStore.rightSidebar()}
            {:else}
              <!-- New Members Widget (only shown when a relay is selected) -->
              <NewMembersWidget />

              <!-- Recent Articles Widget -->
              <div class="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                <div class="flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 class="text-lg font-semibold text-white">Recent Articles</h2>
                </div>
                <div class="space-y-3">
                  {#if recentArticles.length === 0}
                    <div class="h-4 bg-neutral-800 rounded animate-pulse"></div>
                    <div class="h-4 bg-neutral-800 rounded animate-pulse w-3/4"></div>
                    <div class="h-4 bg-neutral-800 rounded animate-pulse"></div>
                  {:else}
                    {#each recentArticles as article (article.id)}
                      <a
                        href="/article/{article.encode()}"
                        class="block text-sm text-neutral-300 hover:text-orange-500 transition-colors line-clamp-2"
                      >
                        {article.title}
                      </a>
                    {/each}
                  {/if}
                </div>
              </div>

              <!-- Journalists Widget -->
              <div class="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                <div class="flex items-center gap-2 mb-4">
                  <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h2 class="text-lg font-semibold text-white">Journalists</h2>
                </div>
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">A</div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-white">Anonymous</p>
                      <p class="text-xs text-neutral-500">Journalist</p>
                    </div>
                    <button class="px-3 py-1 text-xs font-medium text-orange-500 hover:bg-orange-500/10 rounded-full transition-colors">
                      Follow
                    </button>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-white">Anonymous</p>
                      <p class="text-xs text-neutral-500">Journalist</p>
                    </div>
                    <button class="px-3 py-1 text-xs font-medium text-orange-500 hover:bg-orange-500/10 rounded-full transition-colors">
                      Follow
                    </button>
                  </div>
                </div>
                <a href="/journalists" class="block mt-4 text-sm text-orange-500 hover:underline">
                  View all journalists →
                </a>
              </div>

              <!-- Marketplace Widget -->
              <MarketplaceSidebar />

              <!-- Footer -->
              <div class="text-xs text-neutral-500 space-y-2">
                <div class="flex flex-wrap gap-3">
                  <a href="#" class="hover:text-neutral-300 transition-colors">Terms</a>
                  <a href="#" class="hover:text-neutral-300 transition-colors">Privacy</a>
                  <a href="#" class="hover:text-neutral-300 transition-colors">About</a>
                  <a href="#" class="hover:text-neutral-300 transition-colors">Help</a>
                </div>
                <p>© 2024 Agora</p>
              </div>
            {/if}
          </div>
        </aside>
      {/if}
    </div>
  </div>
</div>
