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
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex px-4 sm:px-6 overflow-x-auto">
        {filteredTypes.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
              selected === id
                ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {t(`feed.mediaTypes.${id}`)}
          </button>
        ))}
      </div>
    </div>
  );
}