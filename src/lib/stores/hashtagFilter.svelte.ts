/**
 * Store for managing selected hashtag filters
 * Tracks which hashtags are currently active in the feed filter
 */
class HashtagFilterStore {
  private _selectedHashtags = $state<Set<string>>(new Set());

  get selectedHashtags(): string[] {
    return Array.from(this._selectedHashtags);
  }

  get hasFilters(): boolean {
    return this._selectedHashtags.size > 0;
  }

  toggleHashtag(hashtag: string): void {
    const normalized = hashtag.toLowerCase();
    if (this._selectedHashtags.has(normalized)) {
      this._selectedHashtags.delete(normalized);
    } else {
      this._selectedHashtags.add(normalized);
    }
    // Trigger reactivity
    this._selectedHashtags = new Set(this._selectedHashtags);
  }

  addHashtag(hashtag: string): void {
    const normalized = hashtag.toLowerCase();
    if (!this._selectedHashtags.has(normalized)) {
      this._selectedHashtags.add(normalized);
      this._selectedHashtags = new Set(this._selectedHashtags);
    }
  }

  removeHashtag(hashtag: string): void {
    const normalized = hashtag.toLowerCase();
    if (this._selectedHashtags.has(normalized)) {
      this._selectedHashtags.delete(normalized);
      this._selectedHashtags = new Set(this._selectedHashtags);
    }
  }

  clearAll(): void {
    this._selectedHashtags.clear();
    this._selectedHashtags = new Set();
  }

  isSelected(hashtag: string): boolean {
    return this._selectedHashtags.has(hashtag.toLowerCase());
  }
}

export const hashtagFilter = new HashtagFilterStore();
