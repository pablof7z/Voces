import { Image, MessageCircle, Video, Music, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type MediaType = 'conversations' | 'images' | 'videos' | 'audio' | 'articles';

interface MediaTypeFilterProps {
  selected: MediaType;
  onSelect: (type: MediaType) => void;
  showArticles?: boolean;
}

const mediaTypes = [
  { id: 'conversations' as const, icon: MessageCircle },
  { id: 'images' as const, icon: Image },
  { id: 'videos' as const, icon: Video },
  { id: 'audio' as const, icon: Music },
  { id: 'articles' as const, icon: FileText },
];

export function MediaTypeFilter({ selected, onSelect, showArticles = false }: MediaTypeFilterProps) {
  const { t } = useTranslation();
  const filteredTypes = showArticles ? mediaTypes : mediaTypes.filter(t => t.id !== 'articles');

  return (
    <div className="flex gap-2 px-4 sm:px-6 py-3 overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-800">
      {filteredTypes.map(({ id, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm ${
            selected === id
              ? 'bg-purple-600 dark:bg-purple-500 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="font-medium">{t(`feed.mediaTypes.${id}`)}</span>
        </button>
      ))}
    </div>
  );
}