import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe, Users, Zap, ArrowRight } from 'lucide-react';

const InviteLandingPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const handleStartJourney = () => {
    // Navigate to onboarding with the invite code
    navigate('/onboarding', { state: { inviteCode: code } });
  };

  const handleSignIn = () => {
    // Navigate to login
    navigate('/', { state: { openLogin: true } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Main Card */}
        <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Banner */}
          <div className="h-32 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600" />

          {/* Content Container */}
          <div className="px-8 pb-8 pt-12">
            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
                Your Voice Matters
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Join a global community where every story counts
              </p>
            </div>

            {/* Feature Points */}
            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 text-neutral-900 dark:text-white">
                    Own Your Voice
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    No censorship. No gatekeepers. Your content, your control, forever.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 text-neutral-900 dark:text-white">
                    Earn From Your Stories
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Get paid instantly in Bitcoin for valuable content. No banks, no fees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 text-neutral-900 dark:text-white">
                    Connect With Your Community
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Trade, share, and build with people who understand your journey.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleStartJourney}
                size="lg"
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <button
                onClick={handleSignIn}
                className="w-full text-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors py-2"
              >
                Already have a Nostr account?{' '}
                <span className="font-semibold underline">Sign in here</span>
              </button>
            </div>

            {/* Trust Signals */}
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-xs text-center text-neutral-500">
                Built on Nostr protocol • No personal data required • Leave anytime with your content
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteLandingPage;