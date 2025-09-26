import { Bell } from 'lucide-react';

export function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
        </div>
      </div>
      
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          No notifications yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          When someone mentions you or interacts with your notes, you&apos;ll see it here.
        </p>
      </div>
    </div>
  );
}