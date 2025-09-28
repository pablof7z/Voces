import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingStep, MOCK_INVITER } from '@/features/invites/constants';
import { InviterBranding } from '@/components/invites/onboarding/InviterBranding';
import { GuidedIntroPost } from '@/components/invites/onboarding/GuidedIntroPost';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, PartyPopper } from 'lucide-react';

interface OnboardingWizardProps {
  theme: 'minimal' | 'playful' | 'modern' | 'luxury';
  decryptedPayload?: { name?: string; message?: string };
}

const variants = {
    enter: (direction: number) => ({ 
        opacity: 0, 
        x: direction > 0 ? 50 : -50 
    }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ 
        opacity: 0, 
        x: direction < 0 ? 50 : -50 
    }),
};

export function OnboardingWizard({ theme, decryptedPayload }: OnboardingWizardProps) {
  const [step, setStep] = useState<OnboardingStep>(OnboardingStep.Welcome);
  const [direction, setDirection] = useState(1);
  
  const [name, setName] = useState(decryptedPayload?.name || '');
  const [nip05, setNip05] = useState('');
  const [introPost, setIntroPost] = useState('');

  const nextStep = () => {
    setDirection(1);
    setStep(s => s + 1);
  };

  const renderContent = () => {
    switch (step) {
      case OnboardingStep.Welcome:
        return (
          <motion.div key="welcome" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="text-center">
            <InviterBranding inviter={MOCK_INVITER} />
            {decryptedPayload?.message && (
                <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 mt-6 text-left">
                    <p className="font-bold">A message from {MOCK_INVITER.name}:</p>
                    <p>&ldquo;{decryptedPayload.message}&rdquo;</p>
                </div>
            )}
            <Button onClick={nextStep} size="lg" className="mt-8">Get Started <ArrowRight className="ml-2"/></Button>
          </motion.div>
        );

      case OnboardingStep.Profile:
        return (
            <motion.div key="profile" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
                <h3 className="text-xl font-semibold mb-4 text-center">Create Your Profile</h3>
                <div className="space-y-4">
                    <Input placeholder="Display Name" value={name} onChange={e => setName(e.target.value)} />
                    <Input placeholder="your-username (NIP-05)" value={nip05} onChange={e => setNip05(e.target.value)} />
                </div>
                <Button onClick={nextStep} size="lg" className="mt-8 w-full">Continue</Button>
            </motion.div>
        );

      case OnboardingStep.IntroPost:
        return (
            <motion.div key="intro" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="w-full">
                <GuidedIntroPost introPost={introPost} setIntroPost={setIntroPost} />
                <Button onClick={nextStep} size="lg" className="mt-8 w-full">Publish & Complete Setup</Button>
            </motion.div>
        );

      case OnboardingStep.Complete:
        return (
            <motion.div key="complete" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" className="text-center">
                <PartyPopper size={64} className="mx-auto text-yellow-500 mb-4"/>
                <h2 className="text-2xl font-bold">Welcome to Voces!</h2>
                <p className="text-gray-600 mt-2">Your profile is live and your first post is out in the wild.</p>
                <Button size="lg" className="mt-8">Explore Voces</Button>
            </motion.div>
        );

      default:
        return null;
    }
  };

  const themeClasses = {
      minimal: 'bg-gray-50',
      playful: 'bg-gradient-to-br from-purple-50 to-pink-50',
      modern: 'bg-gray-900 text-white',
      luxury: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white'
  }[theme];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${themeClasses}`}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
                {renderContent()}
            </AnimatePresence>
        </div>
    </div>
  );
}