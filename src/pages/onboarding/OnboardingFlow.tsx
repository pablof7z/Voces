import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNDK, useNDKSessionLogin, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk-hooks';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { bytesToHex } from '@noble/hashes/utils';
import { followPackUsers } from '@/utils/followPacks';
import { useIntroductionPosts } from '@/features/onboarding/hooks/useIntroductionPosts';
import { Step1Community } from './Step1Community';
import { Step2FollowPacks } from './Step2FollowPacks';
import { Step3Marketplace } from './Step3Marketplace';
import { Step4P2PTrades } from './Step4P2PTrades';
import { Step5News } from './Step5News';
import { Step6Profile } from './Step6Profile';
import { Step7Introduction } from './Step7Introduction';
import { Step8Welcome } from './Step8Welcome';

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    banner: 0,
  });
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const navigate = useNavigate();
  const { ndk } = useNDK();
  const login = useNDKSessionLogin();

  // Start fetching introduction posts early
  const { posts: introductionPosts } = useIntroductionPosts();

  const totalSteps = 8;

  // Generate keys and login on mount
  useEffect(() => {
    const initializeKeys = async () => {
      const secretKey = generateSecretKey();
      const privKey = bytesToHex(secretKey);
      const pubKey = getPublicKey(secretKey);
      setPrivateKey(privKey);
      setPublicKey(pubKey);

      // Create signer and login
      const newSigner = new NDKPrivateKeySigner(privKey);
      try {
        await login(newSigner, true);
        console.log('Logged in with new keypair:', pubKey);
      } catch (err) {
        console.error('Error logging in with new keypair:', err);
      }
    };

    initializeKeys();
  }, [login]);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // All events have already been published, just navigate home
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-black">
        <div className="h-1 bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full bg-black dark:bg-white transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Back Button */}
      {currentStep > 1 && (
        <button
          onClick={goBack}
          className="fixed top-6 left-6 z-50 w-9 h-9 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      )}

      {/* Steps */}
      <div className="relative pt-8">
        {currentStep === 1 && (
          <Step1Community
            selectedCommunity={selectedCommunity}
            onSelectCommunity={setSelectedCommunity}
            onNext={() => goToStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2FollowPacks
            selectedCommunity={selectedCommunity}
            selectedPacks={selectedPacks}
            onSelectPacks={setSelectedPacks}
            onNext={async () => {
              // Publish kind:3 contact list when follow packs are selected
              if (selectedPacks.length > 0 && ndk.ndk && publicKey) {
                try {
                  await followPackUsers(ndk.ndk, selectedPacks);
                  console.log(`Published kind:3 with follows from ${selectedPacks.length} packs`);
                } catch (err) {
                  console.error('Error publishing contact list:', err);
                }
              }
              goToStep(3);
            }}
          />
        )}

        {currentStep === 3 && (
          <Step3Marketplace
            onNext={() => goToStep(4)}
          />
        )}

        {currentStep === 4 && (
          <Step4P2PTrades
            onNext={() => goToStep(5)}
          />
        )}

        {currentStep === 5 && (
          <Step5News
            onNext={() => goToStep(6)}
          />
        )}

        {currentStep === 6 && (
          <Step6Profile
            profileData={profileData}
            onUpdateProfile={setProfileData}
            onNext={async () => {
              // Publish kind:0 profile metadata
              if (ndk.ndk && publicKey && profileData.name) {
                try {
                  const { NDKEvent } = await import('@nostr-dev-kit/ndk');
                  const profileEvent = new NDKEvent(ndk.ndk);
                  profileEvent.kind = 0;
                  profileEvent.content = JSON.stringify({
                    name: profileData.name,
                    about: profileData.bio,
                    ...(profileData.location && { location: profileData.location })
                  });
                  await profileEvent.publish();
                  console.log('Published kind:0 profile metadata');
                } catch (err) {
                  console.error('Error publishing profile:', err);
                }
              }
              goToStep(7);
            }}
          />
        )}

        {currentStep === 7 && (
          <Step7Introduction
            publicKey={publicKey}
            profileData={profileData}
            introductionPosts={introductionPosts}
            onNext={() => goToStep(8)}
            onSkip={() => goToStep(8)}
          />
        )}

        {currentStep === 8 && (
          <Step8Welcome
            selectedPacks={selectedPacks}
            profileData={profileData}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </div>
  );
}