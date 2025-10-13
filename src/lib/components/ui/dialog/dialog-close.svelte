<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		onclick,
		...restProps
	}: HTMLButtonAttributes & {
		ref?: HTMLButtonElement | null;
		onclick?: (e: MouseEvent) => void;
	} = $props();
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="dialog-close"
	{onclick}
	{...restProps}
></button>
