import { OnboardingWizard } from '@/features/invites/onboarding/OnboardingWizard';

const InviteOnboarding4 = () => {
  const mockPayload = {
    name: 'Satoshi Nakamoto',
    message: 'The world is changing. Welcome to the frontier.',
  };

  return <OnboardingWizard theme="luxury" decryptedPayload={mockPayload} />;
};

export default InviteOnboarding4;