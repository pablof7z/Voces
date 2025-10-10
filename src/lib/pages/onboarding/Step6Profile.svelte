<script lang="ts">
  interface Props {
    profileData: {
      name: string;
      bio: string;
      location: string;
      banner: number;
    };
    onUpdateProfile: (data: { name: string; bio: string; location: string; banner: number }) => void;
    onNext: () => void;
  }

  let { profileData, onUpdateProfile, onNext }: Props = $props();

  const bannerColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

  function getInitials(name: string) {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function updateField(field: string, value: string) {
    onUpdateProfile({ ...profileData, [field]: value });
  }

  function cycleBanner() {
    const nextBanner = (profileData.banner + 1) % bannerColors.length;
    onUpdateProfile({ ...profileData, banner: nextBanner });
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8">
  <div class="text-center mb-8 max-w-2xl">
    <h1 class="text-4xl font-bold mb-3">You're joining these leaders</h1>
    <p class="text-lg text-neutral-600 dark:text-neutral-400">
      Create your profile to stand alongside influential voices in your community.
    </p>
  </div>

  <!-- Profile cards deck -->
  <div class="relative flex items-center justify-center gap-6 mb-12">
    <!-- Left card - Leopoldo López profile -->
    <div class="w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden transform -rotate-3 scale-95 opacity-80">
      <div
        class="h-32 bg-cover bg-center"
        style="background-image: url(https://m.primal.net/OQwX.jpg)"
      />
      <div class="relative -mt-12 px-6 pb-6">
        <img
          src="https://m.primal.net/OQwW.jpg"
          alt="Leopoldo López"
          class="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 object-cover"
        />
        <div class="mt-4">
          <h3 class="text-xl font-bold">Leopoldo López</h3>
          <p class="text-sm text-neutral-500 mb-2">✓ leo@primal.net</p>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Former Mayor of Caracas (2000-08). Political prisoner 2014-21. Co-founder of World Liberty Congress.
          </p>
        </div>
      </div>
    </div>

    <!-- Center card - User's editable profile -->
    <div class="w-96 bg-white dark:bg-neutral-900 border-2 border-neutral-900 dark:border-neutral-100 rounded-xl overflow-hidden shadow-2xl transform scale-105 z-10">
      <button
        onclick={cycleBanner}
        class="h-36 relative w-full group"
        style={`background-image: ${bannerColors[profileData.banner]}`}
      >
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span class="text-white text-sm font-medium">Click to change</span>
        </div>
      </button>
      <div class="relative -mt-14 px-6 pb-6">
        <div class="w-28 h-28 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full border-4 border-white dark:border-neutral-900 flex items-center justify-center text-3xl font-bold">
          {getInitials(profileData.name)}
        </div>
        <div class="mt-4 space-y-3">
          <div>
            <input
              type="text"
              value={profileData.name}
              oninput={(e) => updateField('name', e.currentTarget.value)}
              placeholder="Your name"
              class="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-neutral-300 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors w-full text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <input
              type="text"
              value={profileData.location}
              oninput={(e) => updateField('location', e.currentTarget.value)}
              placeholder="📍 Your location (optional)"
              class="text-sm text-neutral-500 dark:text-neutral-400 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors w-full"
            />
          </div>
          <div>
            <textarea
              value={profileData.bio}
              oninput={(e) => updateField('bio', e.currentTarget.value)}
              placeholder="Tell your community about yourself..."
              class="text-sm text-neutral-600 dark:text-neutral-400 bg-transparent border border-transparent hover:border-neutral-300 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors w-full resize-none rounded p-2"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right card - Enderson Sequera profile -->
    <div class="w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden transform rotate-3 scale-95 opacity-80">
      <div
        class="h-32 bg-cover bg-center"
        style="background-image: url(https://m.primal.net/OTue.jpg)"
      />
      <div class="relative -mt-12 px-6 pb-6">
        <img
          src="https://m.primal.net/OTkq.jpg"
          alt="Enderson Sequera"
          class="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 object-cover"
        />
        <div class="mt-4">
          <h3 class="text-xl font-bold">Enderson Sequera</h3>
          <p class="text-sm text-neutral-500 mb-2">🇻🇪 Political Scientist</p>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Political advisor & freedom fighter. Bitcoin is freedom - in the fight against dictatorship it saves lives.
          </p>
        </div>
      </div>
    </div>
  </div>

  <button
    onclick={onNext}
    disabled={!profileData.name}
    class={`
      px-8 py-3 rounded-lg font-medium transition-all
      ${profileData.name
        ? 'bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100'
        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
      }
    `}
  >
    Continue →
  </button>
</div>
