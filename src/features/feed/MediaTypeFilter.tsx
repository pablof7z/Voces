import { Image, MessageCircle, Video, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type MediaType = 'conversations' | 'images' | 'videos' | 'articles';

interface MediaTypeFilterProps {
  selected: MediaType;
  onSelect: (type: MediaType) => void;
  showArticles?: boolean;
}

const mediaTypes = [
  { id: 'conversations' as const, icon: MessageCircle },
  { id: 'images' as const, icon: Image },
  { id: 'videos' as const, icon: Video },
  { id: 'articles' as const, icon: FileText },
];

export function MediaTypeFilter({ selected, onSelect, showArticles = true }: MediaTypeFilterProps) {
  const { t } = useTranslation();
  const filteredTypes = showArticles ? mediaTypes : mediaTypes.filter(t => t.id !== 'articles');

  return (
    <div className="flex gap-2 px-4 sm:px-6 py-3 overflow-x-auto scrollbar-hide border-b border-neutral-200 dark:border-neutral-800">
      {filteredTypes.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm ${
            selected === id
              ? 'bg-orange-600 dark:bg-orange-500 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="font-medium">{t(`feed.mediaTypes.${id}`)}</span>
        </button>
      ))}
    </div>
  );
}