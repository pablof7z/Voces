<script lang="ts">
  import HashtagHoverCard from './HashtagHoverCard.svelte';

  interface Props {
    hashtag: string;
    onClick?: (hashtag: string) => void;
    class?: string;
    format?: 'inline' | 'pill';
  }

  let {
    hashtag,
    onClick,
    class: className = '',
    format = 'inline',
  }: Props = $props();

  let isHovering = $state(false);
  let isCardHovering = $state(false);
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let showCard = $state(false);
  let cardPosition = $state({ x: 0, y: 0 });
  let elementRef: HTMLElement | null = $state(null);

  function handleMouseEnter(e: MouseEvent) {
    isHovering = true;

    // Clear any existing hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    // Clear any existing show timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Wait 500ms before showing the card
    hoverTimeout = setTimeout(() => {
      if (isHovering && elementRef) {
        const rect = elementRef.getBoundingClientRect();

        // Position the card below and to the right of the hashtag
        cardPosition = {
          x: rect.left,
          y: rect.bottom + 8
        };

        showCard = true;
      }
    }, 500);
  }

  function handleMouseLeave() {
    isHovering = false;

    // Clear the show timeout if we haven't shown the card yet
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    // Wait a bit before hiding to allow moving to the card
    hideTimeout = setTimeout(() => {
      if (!isHovering && !isCardHovering) {
        showCard = false;
      }
    }, 100);
  }

  function handleCardMouseEnter() {
    isCardHovering = true;

    // Clear any pending hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function handleCardMouseLeave() {
    isCardHovering = false;

    // Hide the card after a short delay
    hideTimeout = setTimeout(() => {
      if (!isHovering && !isCardHovering) {
        showCard = false;
      }
    }, 100);
  }

  function handleClick(e: MouseEvent) {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(hashtag);
    }
  }
</script>

{#if format === 'pill'}
  <!-- Pill format: more prominent hashtag display -->
  <button
    bind:this={elementRef}
    class="hashtag-pill {className}"
    onclick={handleClick}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    type="button"
  >
    <span class="hashtag-prefix">#</span>
    <span class="hashtag-text">{hashtag}</span>
  </button>
{:else}
  <!-- Inline format: compact hashtag display -->
  <a
    bind:this={elementRef}
    href={`#/hashtag/${hashtag}`}
    class="hashtag-inline {className}"
    onclick={handleClick}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    #{hashtag}
  </a>
{/if}

<HashtagHoverCard
  {hashtag}
  isVisible={showCard}
  position={cardPosition}
  onMouseEnter={handleCardMouseEnter}
  onMouseLeave={handleCardMouseLeave}
/>

<style>
  /* Inline hashtag styles */
  .hashtag-inline {
    color: var(--hashtag-color, #fb923c);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .hashtag-inline:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  /* Pill hashtag styles */
  .hashtag-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.125rem;
    padding: 0.25rem 0.625rem;
    background: var(--hashtag-background, #fed7aa);
    border: 1px solid var(--hashtag-border, #fdba74);
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin: 0.125rem;
  }

  .hashtag-pill:hover {
    background: var(--hashtag-hover-background, #fdba74);
    border-color: var(--hashtag-hover-border, #fb923c);
    transform: translateY(-1px);
  }

  .hashtag-prefix {
    color: var(--hashtag-prefix-color, #fb923c);
    font-weight: 400;
  }

  .hashtag-text {
    color: var(--hashtag-text-color, #ea580c);
  }

  /* Dark mode support */
  :global(.dark) .hashtag-pill {
    background: var(--hashtag-background, #431407);
    border-color: var(--hashtag-border, #7c2d12);
  }

  :global(.dark) .hashtag-pill:hover {
    background: var(--hashtag-hover-background, #7c2d12);
    border-color: var(--hashtag-hover-border, #ea580c);
  }

  :global(.dark) .hashtag-inline {
    color: var(--hashtag-color, #fb923c);
  }

  :global(.dark) .hashtag-prefix {
    color: var(--hashtag-prefix-color, #fdba74);
  }

  :global(.dark) .hashtag-text {
    color: var(--hashtag-text-color, #fb923c);
  }
</style>
