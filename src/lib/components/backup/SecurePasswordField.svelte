<script lang="ts">
  interface Props {
    label: string;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    isValid?: boolean;
    touched?: boolean;
    errors?: string[];
    successMessage?: string;
  }

  let {
    label,
    value,
    placeholder,
    onChange,
    onBlur,
    isValid = true,
    touched = false,
    errors = [],
    successMessage
  }: Props = $props();

  let showPassword = $state(false);
  let hasErrors = $derived(touched && errors.length > 0);
  let showSuccess = $derived(touched && isValid && value.length > 0 && successMessage);
</script>

<div>
  <label class="block text-sm font-medium text-neutral-900 dark:text-foreground mb-2">
    {label}
  </label>
  <div class="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      {value}
      oninput={(e) => onChange(e.currentTarget.value)}
      onblur={onBlur}
      {placeholder}
      class="w-full px-3 py-2 pr-10 bg-white dark:bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 {hasErrors ? 'border-red-500 focus:ring-red-500' : 'border focus:ring-orange-500'}"
    />
    <button
      type="button"
      onclick={() => showPassword = !showPassword}
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-neutral-700 dark:hover:text-muted-foreground"
    >
      {#if showPassword}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      {:else}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      {/if}
    </button>
  </div>

  {#if hasErrors}
    <div class="mt-2 space-y-1">
      {#each errors as error}
        <p class="text-xs text-red-500 flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </p>
      {/each}
    </div>
  {/if}

  {#if showSuccess}
    <p class="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {successMessage}
    </p>
  {/if}
</div>
