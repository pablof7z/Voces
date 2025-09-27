import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-6 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <AlertDescription className="flex-1">
          {message}
        </AlertDescription>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
        aria-label="Dismiss error"
      >
        <X className="h-4 w-4" />
      </button>
    </Alert>
  );
}