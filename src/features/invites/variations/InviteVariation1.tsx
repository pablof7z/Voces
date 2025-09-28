import { motion, AnimatePresence } from 'framer-motion';
import { InviteType } from '../constants';
import { useInviteGenerator } from '../hooks/useInviteGenerator';
import { InviteTypeToggle } from '@/components/invites/InviteTypeToggle';
import { GeneratedLink } from '@/components/invites/GeneratedLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const InviteVariation1 = () => {
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

  if (generatedUrl) {
    return <GeneratedLink url={generatedUrl} />;
  }

  return (
    <div>
      <InviteTypeToggle selectedType={inviteType} onTypeChange={setInviteType} />

      <AnimatePresence mode="wait">
        <motion.div
          key={inviteType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {inviteType === InviteType.Personalized && (
            <div className="space-y-4 mt-6">
              <Input 
                placeholder="Invitee's Name (e.g., Tim Garfield)" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                aria-label="Invitee's Name"
              />
              <Textarea 
                placeholder="Add a personal welcome message..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                aria-label="Personal welcome message"
              />
               <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-2xl">💰</span>
                  <p className="text-yellow-700 text-sm font-medium">Attach some sats (soon!)</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 text-center">
        <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full max-w-xs mx-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Generating...' : 'Generate Invite'}
        </Button>
      </div>
    </div>
  );
};

export default InviteVariation1;