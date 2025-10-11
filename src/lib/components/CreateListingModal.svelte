<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { NDKClassified, NDKKind } from '@nostr-dev-kit/ndk';
  import { toast } from '$lib/stores/toast.svelte';
  import { goto } from '$app/navigation';

  interface Props {
    open?: boolean;
    onClose?: () => void;
  }

  let { open = $bindable(false), onClose }: Props = $props();

  let isPublishing = $state(false);

  // Form fields
  let title = $state('');
  let summary = $state('');
  let content = $state('');
  let location = $state('');
  let priceAmount = $state('');
  let priceCurrency = $state('USD');
  let priceFrequency = $state<string | undefined>(undefined);
  let categories = $state<string[]>([]);
  let images = $state<string[]>([]);
  let newCategory = $state('');
  let newImageUrl = $state('');

  const currentUser = ndk.$currentUser;

  const COMMON_CATEGORIES = [
    'electronics',
    'furniture',
    'clothing',
    'books',
    'services',
    'vehicles',
    'real-estate',
    'jobs',
    'free',
    'wanted'
  ];

  const CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC', 'SATS'];

  function addCategory() {
    if (newCategory && !categories.includes(newCategory.toLowerCase())) {
      categories = [...categories, newCategory.toLowerCase()];
      newCategory = '';
    }
  }

  function removeCategory(category: string) {
    categories = categories.filter(c => c !== category);
  }

  function addImage() {
    if (newImageUrl && !images.includes(newImageUrl)) {
      images = [...images, newImageUrl];
      newImageUrl = '';
    }
  }

  function removeImage(image: string) {
    images = images.filter(i => i !== image);
  }

  async function publishListing() {
    if (!title.trim() || !content.trim() || isPublishing) {
      toast.error('Please provide a title and description');
      return;
    }

    if (!currentUser) {
      toast.error('Please log in to create a listing');
      return;
    }

    try {
      isPublishing = true;

      const listing = new NDKClassified(ndk);
      listing.title = title.trim();
      listing.summary = summary.trim() || undefined;
      listing.content = content.trim();
      listing.location = location.trim() || undefined;
      listing.published_at = Math.floor(Date.now() / 1000);

      // Add status tag
      listing.tags.push(['status', 'active']);

      // Add price if provided
      if (priceAmount.trim()) {
        listing.price = {
          amount: parseFloat(priceAmount),
          currency: priceCurrency,
          frequency: priceFrequency && priceFrequency !== 'once' ? priceFrequency : undefined
        };
      }

      // Add categories as hashtags
      categories.forEach(category => {
        listing.tags.push(['t', category]);
      });

      // Add images
      images.forEach(image => {
        listing.tags.push(['image', image]);
      });

      await listing.sign();
      await listing.publish();

      if (listing.publishStatus === 'error') {
        const error = listing.publishError;
        const relayErrors = error?.relayErrors || {};
        const errorMessages = Object.entries(relayErrors)
          .map(([relay, err]) => `${relay}: ${err}`)
          .join('\n');
        toast.error(`Failed to publish:\n${errorMessages || 'Unknown error'}`);
        return;
      }

      toast.success('Listing created successfully');
      resetForm();
      open = false;
      onClose?.();

      // Navigate to marketplace
      goto('/marketplace');
    } catch (error) {
      console.error('Failed to publish listing:', error);
      toast.error(`Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isPublishing = false;
    }
  }

  function resetForm() {
    title = '';
    summary = '';
    content = '';
    location = '';
    priceAmount = '';
    priceCurrency = 'USD';
    priceFrequency = undefined;
    categories = [];
    images = [];
    newCategory = '';
    newImageUrl = '';
  }

  function handleClose() {
    if (!isPublishing) {
      resetForm();
      open = false;
      onClose?.();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !isPublishing) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8"
    onclick={handleBackdropClick}
    role="presentation"
  >
    <div
      class="w-full max-w-4xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl my-auto"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div class="flex items-center gap-3">
          <button
            onclick={handleClose}
            disabled={isPublishing}
            class="text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Create Listing
          </h2>
        </div>
        <button
          onclick={publishListing}
          disabled={!title.trim() || !content.trim() || isPublishing}
          class="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold text-sm"
        >
          {isPublishing ? 'Publishing...' : 'Publish Listing'}
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
        <!-- Basic Details -->
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Title <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              bind:value={title}
              placeholder="What are you listing?"
              class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
              maxlength="200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Summary
            </label>
            <input
              type="text"
              bind:value={summary}
              placeholder="Brief description"
              class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
              maxlength="200"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea
              bind:value={content}
              placeholder="Detailed description (Markdown supported)"
              class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              rows="6"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Location
            </label>
            <input
              type="text"
              bind:value={location}
              placeholder="City, State or Country"
              class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        <!-- Pricing -->
        <div class="bg-neutral-800/30 rounded-lg p-5 border border-neutral-700">
          <h3 class="text-lg font-semibold text-white mb-4">Pricing</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">
                Amount
              </label>
              <input
                type="text"
                bind:value={priceAmount}
                placeholder="0.00"
                class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">
                Currency
              </label>
              <select
                bind:value={priceCurrency}
                class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                {#each CURRENCIES as currency}
                  <option value={currency}>{currency}</option>
                {/each}
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">
                Frequency
              </label>
              <select
                bind:value={priceFrequency}
                class="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value={undefined}>One time</option>
                <option value="hour">Per hour</option>
                <option value="day">Per day</option>
                <option value="week">Per week</option>
                <option value="month">Per month</option>
                <option value="year">Per year</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="bg-neutral-800/30 rounded-lg p-5 border border-neutral-700">
          <h3 class="text-lg font-semibold text-white mb-4">Categories</h3>
          <div class="space-y-4">
            <div class="flex gap-2">
              <select
                bind:value={newCategory}
                class="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="">Select a category</option>
                {#each COMMON_CATEGORIES as cat}
                  <option value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                {/each}
              </select>
              <input
                type="text"
                bind:value={newCategory}
                placeholder="Or type custom"
                class="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                onkeydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCategory();
                  }
                }}
              />
              <button
                type="button"
                onclick={addCategory}
                class="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {#if categories.length > 0}
              <div class="flex flex-wrap gap-2">
                {#each categories as category}
                  <div class="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm">
                    <span>{category}</span>
                    <button
                      type="button"
                      onclick={() => removeCategory(category)}
                      class="hover:text-orange-400"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Images -->
        <div class="bg-neutral-800/30 rounded-lg p-5 border border-neutral-700">
          <h3 class="text-lg font-semibold text-white mb-4">Images</h3>
          <div class="space-y-4">
            <div class="flex gap-2">
              <input
                type="url"
                bind:value={newImageUrl}
                placeholder="Image URL"
                class="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
                onkeydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <button
                type="button"
                onclick={addImage}
                class="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {#if images.length > 0}
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                {#each images as image, index}
                  <div class="relative group">
                    <img
                      src={image}
                      alt={`Listing image ${index + 1}`}
                      class="w-full h-32 object-cover rounded-lg border border-neutral-700"
                    />
                    <button
                      type="button"
                      onclick={() => removeImage(image)}
                      class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Footer hint -->
      <div class="px-6 py-4 border-t border-neutral-800/50 bg-neutral-900/50">
        <p class="text-xs text-neutral-500">
          Press <kbd class="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-400">Esc</kbd> to cancel
        </p>
      </div>
    </div>
  </div>
{/if}
