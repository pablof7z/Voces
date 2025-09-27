import { useState } from 'react';
import { useNDKCurrentUser, useProfile, useSubscribe, NDKKind, useUser } from '@nostr-dev-kit/ndk-hooks';
import { Calendar, Link as LinkIcon, Edit2, Package } from 'lucide-react';
import { NoteCard } from '@/features/feed/NoteCard';
import { useParams } from 'react-router-dom';
import { ProfileEditor } from '@/features/profile/ProfileEditor';
import { PackCard } from '@/features/followPacks/components/PackCard';
import { useProfileFollowPacks } from '@/features/followPacks/hooks/useProfileFollowPacks';
import { MediaGrid } from '@/components/media/MediaGrid';

export function ProfilePage() {
  const { identifier } = useParams<{ identifier?: string }>();
  const currentUser = useNDKCurrentUser();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'replies' | 'media' | 'packs'>('notes');

  // Resolve user from identifier (npub, hex pubkey, nip05, or nprofile)
  const user = useUser(identifier || currentUser?.pubkey);
  const profile = useProfile(user?.pubkey);

  const isOwnProfile = user?.pubkey === currentUser?.pubkey;

  const { events } = useSubscribe(user?.pubkey ? [{
    kinds: [NDKKind.Text],
    authors: [user.pubkey],
    limit: 20,
  }] : false, { subId: 'profile-notes' });

  // Fetch kind:20, 21, 22 media events for the media tab (NIP-68)
  const { events: mediaEvents } = useSubscribe(user?.pubkey && activeTab === 'media' ? [{
    kinds: [
      NDKKind.Image,       // kind:20 - Image file metadata
      NDKKind.Video,       // kind:21 - Video file metadata
      NDKKind.ShortVideo,  // kind:22 - Short video file metadata
    ],
    authors: [user.pubkey],
  }] : false, { subId: 'profile-media' });

  const [packFilter, setPackFilter] = useState<'all' | 'created' | 'appears'>('all');
  const { createdPacks, appearsPacks, allPacks } = useProfileFollowPacks(user?.pubkey || '');

  // Select which packs to show based on filter
  const packs = packFilter === 'created' ? createdPacks :
                packFilter === 'appears' ? appearsPacks :
                allPacks;

  if (!user?.pubkey) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        {/* Cover image */}
        <div className="h-32 sm:h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
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
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-950 object-cover"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-950 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl">
                {(profile?.name || 'A')[0].toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Name and bio */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile?.name || 'Anonymous'}
            </h1>
            {profile?.nip05 && (
              <p className="text-gray-500 dark:text-gray-400">
                @{profile.nip05.split('@')[0]}
              </p>
            )}
            {profile?.about && (
              <p className="mt-3 text-gray-700 dark:text-gray-300">
                {profile.about}
              </p>
            )}
          </div>
          
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            {profile?.website && (
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400"
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
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {events.length}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">Notes</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">0</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">0</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="flex px-4 sm:px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'notes'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}>
            Notes
          </button>
          <button
            onClick={() => setActiveTab('replies')}
            className={`px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'replies'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}>
            Replies
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'media'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}>
            Media
          </button>
          <button
            onClick={() => setActiveTab('packs')}
            className={`px-4 py-3 font-medium whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'packs'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
            {events.map((event) => (
              <NoteCard key={event.id} event={event} />
            ))}
            {events.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No notes yet
              </div>
            )}
          </>
        )}

        {activeTab === 'replies' && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Replies coming soon
          </div>
        )}

        {activeTab === 'media' && (
          <div className="p-4">
            <MediaGrid events={mediaEvents} />
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPackFilter('created')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  packFilter === 'created'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-900'
                }`}
              >
                {isOwnProfile ? 'by you' : `by @${profile?.name || profile?.displayName || user.pubkey.slice(0, 8)}`}
              </button>
              <button
                onClick={() => setPackFilter('appears')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  packFilter === 'appears'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-900'
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
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
    </div>
  );
}