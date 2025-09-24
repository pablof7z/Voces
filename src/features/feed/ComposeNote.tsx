import { useState, type FormEvent } from 'react';
import { useNDK } from '@/contexts/NDKContext';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';

export function ComposeNote() {
  const { ndk, currentUser } = useNDK();
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser) return;

    setIsPublishing(true);
    try {
      const event = new NDKEvent(ndk || undefined);
      event.kind = NDKKind.Text;
      event.content = content;
      event.author = currentUser;
      
      await event.publish();
      setContent('');
    } catch (error) {
      console.error('Failed to publish note:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full p-3 min-h-[100px] resize-none border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isPublishing}
          />
          <div className="flex justify-end mt-3">
            <Button type="submit" disabled={!content.trim() || isPublishing}>
              <Send className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}