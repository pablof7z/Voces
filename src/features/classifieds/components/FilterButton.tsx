import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterButtonProps {
  categories: { value: string; label: string }[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function FilterButton({ categories, selectedCategory, onCategoryChange }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (value: string) => {
    onCategoryChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        {selectedCategory ? categories.find(c => c.value === selectedCategory)?.label : 'Filter'}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50"
            >
              <div className="p-2">
                {selectedCategory && (
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-neutral-900 mb-1"
                  >
                    <span>Clear Filter</span>
                    <X className="w-4 h-4" />
                  </button>
                )}

                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => handleCategorySelect(category.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-neutral-900 ${
                      selectedCategory === category.value
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
                        : ''
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}