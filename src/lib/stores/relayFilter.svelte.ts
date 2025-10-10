/**
 * Store for managing the selected relay filter
 * null = "Following" (all enabled relays)
 * string = specific relay URL to filter by
 */
export const relayFilter = $state<{ selectedRelay: string | null }>({
	selectedRelay: null
});
