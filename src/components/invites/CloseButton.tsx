import { X } from 'lucide-react';

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
      aria-label="Close modal"
    >
      <X size={24} />
    </button>
  );
}