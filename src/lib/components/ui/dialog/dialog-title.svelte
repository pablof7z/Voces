<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLHeadingElement> & {
		ref?: HTMLHeadingElement | null;
	} = $props();
</script>

<h2
	bind:this={ref}
	data-slot="dialog-title"
	class={cn("text-lg font-semibold leading-none", className)}
	{...restProps}
>
	{@render children?.()}
</h2>
