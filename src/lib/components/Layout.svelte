<script lang="ts">
  import { router } from '$lib/router.svelte';
  import { ndk } from '$lib/ndk.svelte';
  import LoginButton from './LoginButton.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  let currentUser = $derived(ndk.activeUser);
  let showMore = $state(false);

  const hideRightSidebar = $derived(
    router.path.startsWith('/article/') ||
    router.path.startsWith('/note/') ||
    router.path.startsWith('/messages/') ||
    router.path.startsWith('/p/') ||
    router.path.startsWith('/packs')
  );
</script>

<div class="min-h-screen bg-black flex justify-center overflow-x-hidden">
  <div class="flex w-full max-w-[1400px] relative">
    <!-- Left Sidebar - Navigation -->
    <aside class="hidden lg:flex w-64 flex-col border-r border-neutral-800/50 p-4">
      <!-- Voces Branding -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[#ff6b35] mb-1">Voces</h1>
        <p class="text-xs text-neutral-500">a WLC project</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-2">
        <a
          href="/"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {router.path === '/' ? 'text-[#ff6b35] bg-[#ff6b35]/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="font-medium">Home</span>
        </a>

        <a
          href="/messages"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {router.path.startsWith('/messages') ? 'text-[#ff6b35] bg-[#ff6b35]/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="font-medium">Messages</span>
        </a>

        <a
          href="/notifications"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {router.path === '/notifications' ? 'text-[#ff6b35] bg-[#ff6b35]/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="font-medium">Notifications</span>
        </a>

        <a
          href="/packs"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors {router.path.startsWith('/packs') ? 'text-[#ff6b35] bg-[#ff6b35]/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="font-medium">Follow Packs</span>
        </a>

        <a
          href="/money"
          class="flex items-center justify-between px-4 py-3 rounded-lg transition-colors {router.path.startsWith('/money') ? 'text-[#ff6b35] bg-[#ff6b35]/10' : 'text-neutral-300 hover:bg-neutral-800/50'}"
        >
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span class="font-medium">Money</span>
          </div>
          <span class="text-xs px-2 py-1 rounded-full bg-[#ff6b35]/20 text-[#ff6b35] font-medium">0 sats</span>
        </a>

        <button
          onclick={() => showMore = !showMore}
          class="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-neutral-300 hover:bg-neutral-800/50"
        >
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span class="font-medium">More</span>
          </div>
          <svg class="w-4 h-4 transition-transform {showMore ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {#if showMore}
          <div class="pl-4 space-y-1">
            <a href="/marketplace" class="block px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors">Marketplace</a>
            <a href="/settings" class="block px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors">Settings</a>
          </div>
        {/if}

        <button
          onclick={() => router.push('/compose')}
          class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ff6b35] hover:bg-[#ff5722] text-white font-semibold rounded-full transition-colors mt-4"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Compose</span>
        </button>
      </nav>

      <!-- Login/User Section -->
      <div class="mt-auto pt-4 border-t border-neutral-800/50">
        {#if !currentUser}
          <LoginButton class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-neutral-100 text-black font-semibold rounded-full transition-colors" />
        {:else}
          <div class="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#ff6b35] flex items-center justify-center text-white font-bold">
                {currentUser.pubkey.slice(0, 2).toUpperCase()}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">User</p>
                <p class="text-xs text-neutral-500 truncate">{currentUser.pubkey.slice(0, 16)}...</p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </aside>

    <!-- Main Content Container -->
    <div class="flex-1 flex">
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
            <!-- Recent Articles Widget -->
            <div class="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 class="text-lg font-semibold text-white">Recent Articles</h2>
              </div>
              <div class="space-y-3">
                <div class="h-4 bg-neutral-800 rounded animate-pulse"></div>
                <div class="h-4 bg-neutral-800 rounded animate-pulse w-3/4"></div>
                <div class="h-4 bg-neutral-800 rounded animate-pulse"></div>
                <div class="h-4 bg-neutral-800 rounded animate-pulse w-2/3"></div>
              </div>
            </div>

            <!-- Journalists Widget -->
            <div class="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <button class="px-3 py-1 text-xs font-medium text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded-full transition-colors">
                    Follow
                  </button>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-white">Anonymous</p>
                    <p class="text-xs text-neutral-500">Journalist</p>
                  </div>
                  <button class="px-3 py-1 text-xs font-medium text-[#ff6b35] hover:bg-[#ff6b35]/10 rounded-full transition-colors">
                    Follow
                  </button>
                </div>
              </div>
              <a href="/journalists" class="block mt-4 text-sm text-[#ff6b35] hover:underline">
                View all journalists →
              </a>
            </div>

            <!-- Footer -->
            <div class="text-xs text-neutral-500 space-y-2">
              <div class="flex flex-wrap gap-3">
                <a href="#" class="hover:text-neutral-300 transition-colors">Terms</a>
                <a href="#" class="hover:text-neutral-300 transition-colors">Privacy</a>
                <a href="#" class="hover:text-neutral-300 transition-colors">About</a>
                <a href="#" class="hover:text-neutral-300 transition-colors">Help</a>
              </div>
              <p>© 2024 Voces</p>
            </div>
          </div>
        </aside>
      {/if}
    </div>
  </div>
</div>
