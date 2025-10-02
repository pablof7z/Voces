<script lang="ts">
  import { router } from '$lib/router.svelte';
  import { ndk } from '$lib/ndk.svelte';
  import Layout from '$lib/components/Layout.svelte';
  import HomePage from '$lib/pages/HomePage.svelte';
  import ComposePage from '$lib/pages/ComposePage.svelte';
  import NotificationsPage from '$lib/pages/NotificationsPage.svelte';
  import ProfilePage from '$lib/pages/ProfilePage.svelte';
  import MoneyPage from '$lib/pages/MoneyPage.svelte';
  import SettingsPage from '$lib/pages/SettingsPage.svelte';
  import FollowPacksPage from '$lib/pages/FollowPacksPage.svelte';
  import FollowPackDetailPage from '$lib/pages/FollowPackDetailPage.svelte';

  function getCurrentPage() {
    const path = router.path;

    if (path === '/' || path === '') return HomePage;
    if (path === '/compose') return ComposePage;
    if (path === '/notifications') return NotificationsPage;
    if (path === '/money') return MoneyPage;
    if (path === '/settings') return SettingsPage;
    if (router.matches('/packs/:packId')) return FollowPackDetailPage;
    if (path === '/packs') return FollowPacksPage;
    if (router.matches('/p/:identifier')) return ProfilePage;

    return HomePage;
  }

  let currentPage = $derived(getCurrentPage());
</script>

{#if router.path.startsWith('/onboarding') || router.path.startsWith('/i/')}
  <svelte:component this={currentPage} />
{:else}
  <Layout>
    <svelte:component this={currentPage} />
  </Layout>
{/if}
