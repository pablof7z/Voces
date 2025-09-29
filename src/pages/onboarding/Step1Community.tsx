import { useState } from 'react';

interface Step1CommunityProps {
  selectedCommunity: string | null;
  onSelectCommunity: (community: string) => void;
  onNext: () => void;
}

const communities = [
  {
    id: 'venezuela',
    name: 'Venezuela',
    flag: '🇻🇪',
    description: 'Connect with the resilient Venezuelan community',
    image: 'https://images.unsplash.com/photo-1520525003249-2b9cdda513bc?w=800&q=80',
    fallbackColor: 'from-yellow-500 to-blue-600',
    leaders: ['María Rodríguez', 'Carlos Mendoza', 'Ana Lucia'],
  },
  {
    id: 'cambodia',
    name: 'Cambodia',
    flag: '🇰🇭',
    description: 'Join voices from the Kingdom of Wonder',
    image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&q=80',
    fallbackColor: 'from-red-500 to-blue-700',
    leaders: ['Sokha Chen', 'Dara Vong', 'Srey Mom'],
  },
  {
    id: 'nicaragua',
    name: 'Nicaragua',
    flag: '🇳🇮',
    description: 'Unite with Nicaraguan changemakers',
    image: 'https://images.unsplash.com/photo-1503542724004-53f16c988e63?w=800&q=80',
    fallbackColor: 'from-blue-500 to-sky-600',
    leaders: ['Roberto Silva', 'Elena Martinez', 'Juan Carlos'],
  },
  {
    id: 'zimbabwe',
    name: 'Zimbabwe',
    flag: '🇿🇼',
    description: 'Connect with Zimbabwe\'s innovators',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
    fallbackColor: 'from-green-600 to-yellow-500',
    leaders: ['Tendai Moyo', 'Grace Ndlovu', 'David Chuma'],
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    flag: '🇦🇫',
    description: 'Support Afghan voices of hope',
    image: 'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=800&q=80',
    fallbackColor: 'from-black to-red-700',
    leaders: ['Ahmad Shah', 'Fatima Rashidi', 'Nasir Khan'],
  },
  {
    id: 'iran',
    name: 'Iran',
    flag: '🇮🇷',
    description: 'Join the Persian community',
    image: 'https://images.unsplash.com/photo-1608592077365-c6399182e63c?w=800&q=80',
    fallbackColor: 'from-green-600 to-red-600',
    leaders: ['Reza Hosseini', 'Maryam Azadi', 'Ali Karimi'],
  },
];

function CommunityCard({ community, isSelected, onClick }: {
  community: typeof communities[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg border-2 transition-all
        ${isSelected
          ? 'border-black dark:border-white shadow-lg scale-[1.02]'
          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
        }
      `}
    >
      <div className="relative h-32">
        {!imageError ? (
          <img
            src={community.image}
            alt={community.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${community.fallbackColor}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl">{community.flag}</span>
            <span className="font-semibold">{community.name}</span>
          </div>
          <div className="text-xs text-white/80 mt-1">
            {community.leaders.length} community leaders
          </div>
        </div>
      </div>
    </button>
  );
}

export function Step1Community({ selectedCommunity, onSelectCommunity, onNext }: Step1CommunityProps) {
  const [mainImageError, setMainImageError] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Editorial Image */}
      <div className="hidden lg:block w-1/2 relative">
        {!mainImageError ? (
          <img
            src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80"
            alt="Community gathering"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setMainImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h1 className="text-5xl font-bold mb-4">
            Your Voice Matters
          </h1>
          <p className="text-xl opacity-90">
            Join a community where every voice counts. Connect with leaders,
            share stories, and build the future together.
          </p>
        </div>
      </div>

      {/* Right Panel - Community Selection */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-xl w-full">
          <div className="mb-12 lg:hidden">
            <h1 className="text-4xl font-bold mb-3">Your Voice Matters</h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Choose your community to connect with local voices
            </p>
          </div>

          <div className="lg:mb-8">
            <h2 className="text-2xl font-semibold mb-3">Choose Your Community</h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Select where you want to connect and contribute
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isSelected={selectedCommunity === community.id}
                onClick={() => onSelectCommunity(community.id)}
              />
            ))}
          </div>

          <button
            onClick={onNext}
            disabled={!selectedCommunity}
            className={`
              w-full py-4 px-6 rounded-lg font-medium transition-all
              ${selectedCommunity
                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200'
                : 'bg-neutral-100 dark:bg-black text-neutral-400 cursor-not-allowed'
              }
            `}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}