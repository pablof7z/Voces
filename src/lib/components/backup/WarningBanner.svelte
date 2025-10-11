<script lang="ts">
  interface Props {
    title: string;
    description: string;
    variant?: 'warning' | 'danger';
  }

  let { title, description, variant = 'warning' }: Props = $props();

  let bgColor = $derived(variant === 'danger'
    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900');

  let iconColor = $derived(variant === 'danger'
    ? 'text-red-600 dark:text-red-400'
    : 'text-amber-600 dark:text-amber-400');

  let textColor = $derived(variant === 'danger'
    ? 'text-red-900 dark:text-red-200'
    : 'text-amber-900 dark:text-amber-200');

  let descColor = $derived(variant === 'danger'
    ? 'text-red-700 dark:text-red-300'
    : 'text-amber-700 dark:text-amber-300');
</script>

<div class="p-4 border rounded-lg {bgColor}">
  <div class="flex gap-3">
    <svg class="w-5 h-5 flex-shrink-0 mt-0.5 {iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <div class="flex-1 text-sm {textColor}">
      <p class="font-semibold mb-1">
        {title}
      </p>
      <p class="text-xs {descColor}">
        {description}
      </p>
    </div>
  </div>
</div>
