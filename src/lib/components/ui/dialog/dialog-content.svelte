<script lang="ts">
	import XIcon from "@lucide/svelte/icons/x";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		showCloseButton = true,
		onClose,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | null;
		children: Snippet;
		showCloseButton?: boolean;
		onClose?: () => void;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="dialog-content"
	class={cn(
		"relative bg-background border rounded-lg p-6 shadow-lg w-full max-w-[calc(100%-2rem)] sm:max-w-lg grid gap-4 animate-in fade-in-0 zoom-in-95 duration-200",
		className
	)}
	role="document"
	{...restProps}
>
	{@render children()}
	{#if showCloseButton && onClose}
		<button
			type="button"
			onclick={onClose}
			class="ring-offset-background focus:ring-ring rounded-xs focus:outline-hidden absolute end-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
			aria-label="Close"
		>
			<XIcon />
			<span class="sr-only">Close</span>
		</button>
	{/if}
</div>
