import { AlertCircle } from 'lucide-react';

interface WarningBannerProps {
  title: string;
  description: string;
  variant?: 'warning' | 'danger';
}

export function WarningBanner({ 
  title, 
  description, 
  variant = 'warning' 
}: WarningBannerProps) {
  const bgColor = variant === 'danger' 
    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900';
    
  const iconColor = variant === 'danger'
    ? 'text-red-600 dark:text-red-400'
    : 'text-amber-600 dark:text-amber-400';
    
  const textColor = variant === 'danger'
    ? 'text-red-900 dark:text-red-200'
    : 'text-amber-900 dark:text-amber-200';
    
  const descColor = variant === 'danger'
    ? 'text-red-700 dark:text-red-300'
    : 'text-amber-700 dark:text-amber-300';

  return (
    <div className={`p-4 border rounded-lg ${bgColor}`}>
      <div className="flex gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className={`flex-1 text-sm ${textColor}`}>
          <p className="font-semibold mb-1">
            {title}
          </p>
          <p className={`text-xs ${descColor}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}