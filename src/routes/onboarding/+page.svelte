<script lang="ts">
  import { page } from '$app/stores';
  import OnboardingFlow from '$lib/pages/OnboardingFlow.svelte';

  const inviteCode = $derived($page.state?.inviteCode);
</script>

<OnboardingFlow {inviteCode} />
