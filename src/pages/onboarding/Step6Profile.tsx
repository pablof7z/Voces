
interface Step6ProfileProps {
  profileData: {
    name: string;
    bio: string;
    location: string;
    banner: number;
  };
  onUpdateProfile: (data: { name: string; bio: string; location: string; banner: number }) => void;
  onNext: () => void;
}

const bannerColors = [
  '#1a1a1a',
  '#2a2a2a',
  '#3a3a3a',
  '#4a4a4a',
  '#5a5a5a',
];

export function Step6Profile({ profileData, onUpdateProfile, onNext }: Step6ProfileProps) {

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const updateField = (field: string, value: string) => {
    onUpdateProfile({ ...profileData, [field]: value });
  };

  const cycleBanner = () => {
    const nextBanner = (profileData.banner + 1) % bannerColors.length;
    onUpdateProfile({ ...profileData, banner: nextBanner });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-3">You&apos;re joining these leaders</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Create your profile to stand alongside influential voices in your community.
        </p>
      </div>

      {/* Profile cards deck */}
      <div className="relative flex items-center justify-center gap-6 mb-12">
        {/* Left card - Example profile */}
        <div className="w-80 bg-neutral-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transform -rotate-3 scale-95 opacity-80">
          <div className="h-32 bg-gray-800" />
          <div className="relative -mt-12 px-6 pb-6">
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-2xl font-bold">
              MR
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold">María Rodríguez</h3>
              <p className="text-sm text-gray-500 mb-2">📍 Caracas · 5.2K followers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Community organizer. Fighting for a better tomorrow. Building networks of mutual aid.
              </p>
            </div>
          </div>
        </div>

        {/* Center card - User's editable profile */}
        <div className="w-96 bg-neutral-card border-2 border-black dark:border-white rounded-xl overflow-hidden shadow-2xl transform scale-105 z-10">
          <div
            className="h-36 relative cursor-pointer group"
            style={{ background: bannerColors[profileData.banner] }}
            onClick={cycleBanner}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-sm font-medium">Click to change</span>
            </div>
          </div>
          <div className="relative -mt-14 px-6 pb-6">
            <div className="w-28 h-28 bg-black dark:bg-white text-white dark:text-black rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-3xl font-bold">
              {getInitials(profileData.name)}
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Your name"
                  className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-black dark:focus:border-white outline-none transition-colors w-full"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="📍 Your location (optional)"
                  className="text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-black dark:focus:border-white outline-none transition-colors w-full"
                />
              </div>
              <div>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell your community about yourself..."
                  className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border border-transparent hover:border-gray-300 focus:border-black dark:focus:border-white outline-none transition-colors w-full resize-none rounded p-2"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right card - Example profile */}
        <div className="w-80 bg-neutral-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transform rotate-3 scale-95 opacity-80">
          <div className="h-32 bg-gray-700" />
          <div className="relative -mt-12 px-6 pb-6">
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-2xl font-bold">
              JG
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold">Jorge García</h3>
              <p className="text-sm text-gray-500 mb-2">📍 Valencia · 8K followers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Independent journalist. Building tech tools for community empowerment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!profileData.name}
        className={`
          px-8 py-3 rounded-lg font-medium transition-all
          ${profileData.name
            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
            : 'bg-gray-100 dark:bg-black text-gray-400 cursor-not-allowed'
          }
        `}
      >
        Continue →
      </button>
    </div>
  );
}