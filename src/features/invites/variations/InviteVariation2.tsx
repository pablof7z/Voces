import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InviteType } from '../constants';
import { useInviteGenerator } from '../hooks/useInviteGenerator';
import { GeneratedLink } from '@/components/invites/GeneratedLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, Gift } from 'lucide-react';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

const InviteVariation2 = () => {
  const {
    inviteType,
    setInviteType,
    generatedUrl,
    name,
    setName,
    message,
    setMessage,
    isLoading,
    handleGenerate,
  } = useInviteGenerator();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  if (generatedUrl) {
    return <GeneratedLink url={generatedUrl} />;
  }

  const Step1 = (
    <motion.div
      key="step1"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
      className="w-full"
    >
      <h3 className="text-center font-semibold mb-4 text-lg">Who is this invite for?</h3>
      <div
        onClick={() => { setInviteType(InviteType.General); handleNext(); }}
        className="p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 mb-3"
      >
        <p className="font-bold">Everyone</p>
        <p className="text-sm text-neutral-500">Create a generic link to share anywhere.</p>
      </div>
      <div
        onClick={() => { setInviteType(InviteType.Personalized); handleNext(); }}
        className="p-4 border rounded-lg cursor-pointer hover:bg-neutral-50"
      >
        <p className="font-bold">Someone Specific</p>
        <p className="text-sm text-neutral-500">Personalize the invite with a name and message.</p>
      </div>
    </motion.div>
  );

  const Step2 = (
    <motion.div
      key="step2"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
      className="w-full space-y-4"
    >
      <h3 className="text-center font-semibold mb-4 text-lg">Personalize Your Invite</h3>
      <Input placeholder="Invitee's Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea placeholder="Welcome message..." value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button onClick={handleNext} className="w-full">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </motion.div>
  );
  
  const Step3 = (
    <motion.div
      key="step3"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
      className="w-full text-center"
    >
        <h3 className="text-center font-semibold mb-4 text-lg">Add a Bonus? (Coming Soon)</h3>
        <div className="p-6 border-4 border-dashed border-yellow-300 rounded-xl bg-yellow-50 text-center">
            <Gift size={48} className="mx-auto text-yellow-500 mb-3" />
            <p className="font-bold text-yellow-800">Surprise them with some sats!</p>
            <p className="text-sm text-yellow-600">The ability to attach a Cashu token is coming in a future update.</p>
        </div>
    </motion.div>
  );

  return (
    <div className="min-h-[300px]">
      <AnimatePresence mode="wait">
        {step === 1 ? Step1 : (inviteType === InviteType.Personalized && step === 2) ? Step2 : Step3}
      </AnimatePresence>

      <div className="mt-6 flex justify-between items-center">
        {step > 1 ? (
          <Button variant="ghost" onClick={handleBack}>Back</Button>
        ) : <div />} 
        {(step === 3 || (inviteType === InviteType.General && step !== 1)) && (
            <Button onClick={handleGenerate} disabled={isLoading} size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Finish & Generate
            </Button>
        )}
      </div>
    </div>
  );
};

export default InviteVariation2;