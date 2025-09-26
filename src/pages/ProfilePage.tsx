import { useState, useEffect } from 'react';
import { useNDKCurrentUser, useProfile, useSubscribe, NDKKind, useNDK } from '@nostr-dev-kit/ndk-hooks';
import { Calendar, Link as LinkIcon, Edit2, Package } from 'lucide-react';
import { NoteCard } from '@/features/feed/NoteCard';
import { useParams } from 'react-router-dom';
import { ProfileEditor } from '@/features/profile/ProfileEditor';
import { nip19 } from 'nostr-tools';
import { FollowPackCard } from '@/features/followPacks/components/FollowPackCard';
import { useFollowPacks } from '@/features/followPacks/hooks/useFollowPacks';

export function ProfilePage() {
  const { identifier } = useParams<{ identifier?: string }>();
  const currentUser = useNDKCurrentUser();
  const { ndk } = useNDK();
  const [targetPubkey, setTargetPubkey] = useState<string | undefined>();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'replies' | 'media' | 'packs'>('notes');

  useEffect(() => {
    async function resolveIdentifier() {
      if (!identifier) {
        setTargetPubkey(currentUser?.pubkey);
        return;
      }

      // Check if it's an npub
      if (identifier.startsWith('npub')) {
        try {
          const decoded = nip19.decode(identifier);
          if (decoded.type === 'npub') {
            setTargetPubkey(decoded.data as string);
          }
        } catch (error) {
          console.error('Invalid npub:', error);
        }
      } else if (identifier.includes('@') || identifier.includes('.')) {
        // It's likely a NIP-05 identifier
        try {
          const user = await ndk?.getUserFromNip05(identifier);
          if (user) {
            setTargetPubkey(user.pubkey);
          }
        } catch (error) {
          console.error('Failed to resolve NIP-05:', error);
        }
      }
    }

    resolveIdentifier();
  }, [identifier, currentUser, ndk]);

  const profile = useProfile(targetPubkey);

  const isOwnProfile = targetPubkey === currentUser?.pubkey;

  const { events } = useSubscribe(targetPubkey ? [{
    kinds: [NDKKind.Text],
    authors: [targetPubkey],
    limit: 20,
  }] : []);

  const { packs } = useFollowPacks(targetPubkey);

  if (!targetPubkey) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
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
              className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 rounded-lg transition-colors backdrop-blur-sm"
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
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
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
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Media coming soon
          </div>
        )}

        {activeTab === 'packs' && (
          <div className="p-4 space-y-4">
            {packs.length > 0 ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {isOwnProfile ? 'Your Follow Packs' : 'Follow Packs'}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {packs.map((pack) => (
                    <FollowPackCard key={pack.id} pack={pack} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {isOwnProfile
                  ? "You haven't created any follow packs yet"
                  : "No follow packs yet"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Editor Modal */}
      {isEditingProfile && targetPubkey && (
        <ProfileEditor
          pubkey={targetPubkey}
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