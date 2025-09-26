import { useSubscribe, NDKKind } from '@nostr-dev-kit/ndk-hooks';
import { NoteCard } from './NoteCard';

export function NoteFeed() {
  const { events } = useSubscribe([{
    kinds: [NDKKind.Text],
  }], { subId: 'note-feed' });

  if (events.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-gray-500 dark:text-gray-400">
          No notes yet. Be the first to share something!
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {events.length}
      {events.map((event) => (
        <NoteCard key={event.id} event={event} />
      ))}
    </div>
  );
}