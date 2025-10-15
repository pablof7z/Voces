<script lang="ts">
  import { Tooltip as TooltipPrimitive } from 'bits-ui';
  import type { Snippet } from 'svelte';

  let {
    asChild = false,
    children
  }: {
    asChild?: boolean;
    children: Snippet<[{ builder: any }]>;
  } = $props();
</script>

<TooltipPrimitive.Trigger {asChild} let:builder>
  {@render children({ builder })}
</TooltipPrimitive.Trigger>
