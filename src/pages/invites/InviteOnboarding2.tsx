import { OnboardingWizard } from '@/features/invites/onboarding/OnboardingWizard';

const InviteOnboarding2 = () => {
  const mockPayload = {
    name: 'Jane Doe',
    message: 'So glad you could make it! Welcome to Voces!',
  };

  return <OnboardingWizard theme="playful" decryptedPayload={mockPayload} />;
};

export default InviteOnboarding2;