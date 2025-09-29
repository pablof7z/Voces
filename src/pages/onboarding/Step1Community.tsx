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
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
    leaders: ['María Rodríguez', 'Carlos Mendoza', 'Ana Lucia'],
  },
  {
    id: 'cambodia',
    name: 'Cambodia',
    flag: '🇰🇭',
    description: 'Join voices from the Kingdom of Wonder',
    image: 'https://images.unsplash.com/photo-1554290712-e640351074bd?w=800&q=80',
    leaders: ['Sokha Chen', 'Dara Vong', 'Srey Mom'],
  },
  {
    id: 'nicaragua',
    name: 'Nicaragua',
    flag: '🇳🇮',
    description: 'Unite with Nicaraguan changemakers',
    image: 'https://images.unsplash.com/photo-1512813389649-acb9131ced20?w=800&q=80',
    leaders: ['Roberto Silva', 'Elena Martinez', 'Juan Carlos'],
  },
  {
    id: 'zimbabwe',
    name: 'Zimbabwe',
    flag: '🇿🇼',
    description: 'Connect with Zimbabwe\'s innovators',
    image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800&q=80',
    leaders: ['Tendai Moyo', 'Grace Ndlovu', 'David Chuma'],
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    flag: '🇦🇫',
    description: 'Support Afghan voices of hope',
    image: 'https://images.unsplash.com/photo-1604134967494-8a9ed3adea0d?w=800&q=80',
    leaders: ['Ahmad Shah', 'Fatima Rashidi', 'Nasir Khan'],
  },
  {
    id: 'iran',
    name: 'Iran',
    flag: '🇮🇷',
    description: 'Join the Persian community',
    image: 'https://images.unsplash.com/photo-1553603227-2358aabe821e?w=800&q=80',
    leaders: ['Reza Hosseini', 'Maryam Azadi', 'Ali Karimi'],
  },
];

export function Step1Community({ selectedCommunity, onSelectCommunity, onNext }: Step1CommunityProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Editorial Image */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80"
          alt="Community gathering"
          className="absolute inset-0 w-full h-full object-cover"
        />
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
            <p className="text-gray-600 dark:text-gray-400">
              Choose your community to connect with local voices
            </p>
          </div>

          <div className="lg:mb-8">
            <h2 className="text-2xl font-semibold mb-3">Choose Your Community</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Select where you want to connect and contribute
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {communities.map((community) => (
              <button
                key={community.id}
                onClick={() => onSelectCommunity(community.id)}
                className={`
                  relative overflow-hidden rounded-lg border-2 transition-all
                  ${selectedCommunity === community.id
                    ? 'border-black dark:border-white shadow-lg scale-[1.02]'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="relative h-32">
                  <img
                    src={community.image}
                    alt={community.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
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
            ))}
          </div>

          <button
            onClick={onNext}
            disabled={!selectedCommunity}
            className={`
              w-full py-4 px-6 rounded-lg font-medium transition-all
              ${selectedCommunity
                ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                : 'bg-gray-100 dark:bg-black text-gray-400 cursor-not-allowed'
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