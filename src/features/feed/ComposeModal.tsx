import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ComposeNote } from './ComposeNote';

interface ComposeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComposeModal({ open, onOpenChange }: ComposeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-neutral-800 bg-black p-6">
        <ComposeNote onPublish={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}