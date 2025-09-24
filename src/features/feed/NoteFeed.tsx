import { useSubscribe, NDKKind, type NDKEvent } from '@nostr-dev-kit/ndk-hooks';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

export function NoteFeed() {
  const { events, eose } = useSubscribe([{
    kinds: [NDKKind.Text],
    limit: 20,
  }]);

  if (!eose) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No notes found. Connect to more relays or follow more people!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event: NDKEvent) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {event.author?.profile?.image && (
                  <img
                    src={event.author.profile.image}
                    alt={event.author.profile.name || 'Author'}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold">
                    {event.author?.profile?.name || event.pubkey.slice(0, 8) + '...'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.author?.profile?.nip05 || event.author?.npub.slice(0, 12) + '...'}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(event.created_at! * 1000), { addSuffix: true })}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap break-words">{event.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}