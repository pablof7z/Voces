import { useState } from 'react';
import { useNDKCurrentUser, useProfile, useSubscribe, NDKKind, useUser } from '@nostr-dev-kit/ndk-hooks';
import { Calendar, Link as LinkIcon, Edit2, Package, FileText, Share2 } from 'lucide-react';
import { NoteCard } from '@/features/feed/NoteCard';
import { useParams } from 'react-router-dom';
import { ProfileEditor } from '@/features/profile/ProfileEditor';
import { PackCard } from '@/features/followPacks/components/PackCard';
import { useProfileFollowPacks } from '@/features/followPacks/hooks/useProfileFollowPacks';
import { MediaGrid } from '@/components/media/MediaGrid';
import { FollowButton } from '@/components/ui/FollowButton';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import { useUserArticles } from '@/features/articles/hooks/useUserArticles';
import { ArticleList } from '@/features/articles/components/ArticleList';
import { ShareProfileModal } from '@/features/profile/ShareProfileModal';

export function ProfilePage() {
  const { identifier } = useParams<{ identifier?: string }>();
  const currentUser = useNDKCurrentUser();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'replies' | 'media' | 'articles' | 'packs'>('notes');

  // Resolve user from identifier (npub, hex pubkey, nip05, or nprofile)
  const user = useUser(identifier || currentUser?.pubkey);
  const profile = useProfile(user?.pubkey);

  const isOwnProfile = user?.pubkey === currentUser?.pubkey;

  const { events: allTextEvents } = useSubscribe(user?.pubkey ? [{
    kinds: [NDKKind.Text],
    authors: [user.pubkey],
    limit: 100,
  }] : false, { subId: 'profile-notes' });

  // Helper to check if content has media URLs
  const hasMediaUrl = (content: string): boolean => {
    const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|avif|mp4|webm|mov|avi|mkv))/gi;
    return urlRegex.test(content);
  };

  // Filter notes (kind:1 without 'e' tag) and replies (kind:1 with 'e' tag)
  const notes = allTextEvents.filter(event => !event.tags.some(tag => tag[0] === 'e'));
  const replies = allTextEvents.filter(event => event.tags.some(tag => tag[0] === 'e'));

  // Media: kind:1 events with media URLs in content
  const textMediaEvents = allTextEvents.filter(event => hasMediaUrl(event.content));

  // Fetch kind:20, 21, 22 media events for the media tab (NIP-68)
  const { events: nip68MediaEvents } = useSubscribe(user?.pubkey && activeTab === 'media' ? [{
    kinds: [
      NDKKind.Image,       // kind:20 - Image file metadata
      NDKKind.Video,       // kind:21 - Video file metadata
      NDKKind.ShortVideo,  // kind:22 - Short video file metadata
    ],
    authors: [user.pubkey],
  }] : false, { subId: 'profile-media' });

  // Combine NIP-68 media events with kind:1 text events that have media
  const allMediaEvents = [...nip68MediaEvents, ...textMediaEvents];

  const [packFilter, setPackFilter] = useState<'all' | 'created' | 'appears'>('all');
  const { createdPacks, appearsPacks, allPacks } = useProfileFollowPacks(user?.pubkey || '');

  // Select which packs to show based on filter
  const packs = packFilter === 'created' ? createdPacks :
                packFilter === 'appears' ? appearsPacks :
                allPacks;

  const { articles, isLoading: articlesLoading } = useUserArticles(user?.pubkey);
  const hasArticles = articles.length > 0;

  if (!user?.pubkey) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800">
        {/* Cover image */}
        <div className="h-32 sm:h-48 bg-gradient-to-br from-orange-500 to-red-500 relative">
          {profile?.banner && (
            <img
              src={profile.banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-black/90 hover:bg-white dark:hover:bg-neutral-900 rounded-lg transition-colors backdrop-blur-sm"
              aria-label="Edit profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Profile info */}
        <div className="px-4 sm:px-6 pb-4">
          {/* Avatar */}
          <div className="relative -mt-12 sm:-mt-16 mb-4">
            {profile?.picture ? (
              <img
                src={profile.picture}
                alt={profile?.name || 'Profile'}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-neutral-950 object-cover"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-neutral-950 bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-3xl">
                {(profile?.name || 'A')[0].toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Name and bio */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {profile?.name || 'Anonymous'}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    {profile?.nip05 ? `@${profile.nip05.split('@')[0]}` : `${user.npub?.slice(0, 12)}...`}
                  </p>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    aria-label="Share profile"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <FollowButton pubkey={user.pubkey} />
            </div>
            {profile?.about && (
              <div className="mt-3">
                <ContentRenderer
                  content={profile.about}
                  className="text-neutral-700 dark:text-neutral-300"
                />
              </div>
            )}
          </div>
          
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            {profile?.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-500"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined recently</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {notes.length}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 ml-1">Notes</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">0</span>
              <span className="text-neutral-500 dark:text-neutral-400 ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">0</span>
              <span className="text-neutral-500 dark:text-neutral-400 ml-1">Followers</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex px-4 sm:px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'notes'
                ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}>
            Notes
          </button>
          <button
            onClick={() => setActiveTab('replies')}
            className={`px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'replies'
                ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}>
            Replies
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'media'
                ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}>
            Media
          </button>
          {hasArticles && (
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'articles'
                  ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500'
                  : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
              }`}>
              <FileText className="w-4 h-4" />
              Articles
            </button>
          )}
          <button
            onClick={() => setActiveTab('packs')}
            className={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'packs'
                ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
            }`}>
            <Package className="w-4 h-4" />
            Follow Packs
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div>
        {activeTab === 'notes' && (
          <>
            {notes.map((event) => (
              <NoteCard key={event.id} event={event} />
            ))}
            {notes.length === 0 && (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No notes yet
              </div>
            )}
          </>
        )}

        {activeTab === 'replies' && (
          <>
            {replies.map((event) => (
              <NoteCard key={event.id} event={event} />
            ))}
            {replies.length === 0 && (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No replies yet
              </div>
            )}
          </>
        )}

        {activeTab === 'media' && (
          <div className="p-4">
            <MediaGrid events={allMediaEvents} />
          </div>
        )}

        {activeTab === 'articles' && (
          <div>
            <ArticleList 
              articles={articles} 
              isLoading={articlesLoading}
              emptyMessage={isOwnProfile ? "You haven't published any articles yet" : "No articles published yet"}
            />
          </div>
        )}

        {activeTab === 'packs' && (
          <div className="p-4 space-y-4">
            {/* Filter tabs for follow packs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPackFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  packFilter === 'all'
                    ? 'bg-orange-600 text-white'
                    : 'bg-neutral-100 dark:bg-black text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPackFilter('created')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  packFilter === 'created'
                    ? 'bg-orange-600 text-white'
                    : 'bg-neutral-100 dark:bg-black text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-900'
                }`}
              >
                {isOwnProfile ? 'by you' : `by @${profile?.name || profile?.displayName || user.pubkey.slice(0, 8)}`}
              </button>
              <button
                onClick={() => setPackFilter('appears')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  packFilter === 'appears'
                    ? 'bg-orange-600 text-white'
                    : 'bg-neutral-100 dark:bg-black text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-900'
                }`}
              >
                {isOwnProfile ? 'with you' : `with @${profile?.name || profile?.displayName || user.pubkey.slice(0, 8)}`}
              </button>
            </div>

            {packs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {packs.map((pack) => (
                  <PackCard key={pack.id} pack={pack} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                {packFilter === 'created'
                  ? (isOwnProfile
                      ? "You haven't created any follow packs yet"
                      : `@${profile?.name || 'user'} hasn't created any follow packs yet`)
                  : packFilter === 'appears'
                  ? (isOwnProfile
                      ? "You don't appear on any follow packs yet"
                      : `@${profile?.name || 'user'} doesn't appear on any follow packs yet`)
                  : "No follow packs found"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Editor Modal */}
      {isEditingProfile && user?.pubkey && (
        <ProfileEditor
          pubkey={user.pubkey}
          onClose={() => setIsEditingProfile(false)}
          onSave={() => {
            setIsEditingProfile(false);
            // Profile will auto-update via the useProfile hook
          }}
        />
      )}

      {/* Share Profile Modal */}
      {user?.pubkey && user?.npub && (
        <ShareProfileModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          pubkey={user.pubkey}
          npub={user.npub}
        />
      )}
    </div>
  );
}