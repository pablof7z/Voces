import { motion } from 'framer-motion';
import { InviteType } from '../constants';
import { useInviteGenerator } from '../hooks/useInviteGenerator';
import { GeneratedLink } from '@/components/invites/GeneratedLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Users, UserPlus, Gift } from 'lucide-react';

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 ${className}`}
  >
    {children}
  </div>
);

const InviteVariation3 = () => {
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
    return (
        <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800">
            <GeneratedLink url={generatedUrl} />
        </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard className={`cursor-pointer transition-all duration-300 ${inviteType === InviteType.General ? 'border-orange-500 border-2' : ''}`}>
          <button onClick={() => setInviteType(InviteType.General)} className="w-full text-center">
            <Users className="mx-auto mb-2" />
            <p className="font-bold">General</p>
          </button>
        </GlassCard>
        <GlassCard className={`cursor-pointer transition-all duration-300 ${inviteType === InviteType.Personalized ? 'border-orange-500 border-2' : ''}`}>
          <button onClick={() => setInviteType(InviteType.Personalized)} className="w-full text-center">
            <UserPlus className="mx-auto mb-2" />
            <p className="font-bold">Personal</p>
          </button>
        </GlassCard>
      </div>

      {inviteType === InviteType.Personalized && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="space-y-4 mb-6 overflow-hidden"
        >
            <Input placeholder="Invitee's Name" value={name} onChange={e => setName(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-neutral-300" />
            <Textarea placeholder="Welcome message..." value={message} onChange={e => setMessage(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-neutral-300" />
            <div className="flex items-center space-x-3 p-3 bg-white/10 border border-white/20 rounded-lg">
                  <Gift className="text-yellow-300" />
                  <p className="text-neutral-200 text-sm font-medium">Gifting sats coming soon!</p>
            </div>
        </motion.div>
      )}

      <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg">
        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        {isLoading ? 'Creating Magic Link...' : 'Generate Invite'}
      </Button>
    </div>
  );
};

export default InviteVariation3;