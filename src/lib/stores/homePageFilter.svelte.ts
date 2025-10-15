type MediaFilter = 'conversations' | 'images' | 'videos' | 'articles';

let selectedFilter = $state<MediaFilter>('conversations');

export const homePageFilter = {
  get selected() {
    return selectedFilter;
  },
  set(filter: MediaFilter) {
    selectedFilter = filter;
  }
};
