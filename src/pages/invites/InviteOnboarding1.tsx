import { OnboardingWizard } from '@/features/invites/onboarding/OnboardingWizard';

const InviteOnboarding1 = () => {
  const mockPayload = {
    name: 'Tim Garfield',
    message: 'Welcome, Tim! Have some sats for your brand new wallet!',
  };

  return <OnboardingWizard theme="minimal" decryptedPayload={mockPayload} />;
};

export default InviteOnboarding1;