import { ComposeNote } from '@/features/feed/ComposeNote';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function ComposePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Compose</h2>
        </div>
      </div>
      
      {/* Compose section */}
      <div className="p-4 sm:p-6">
        <ComposeNote />
      </div>
    </div>
  );
}