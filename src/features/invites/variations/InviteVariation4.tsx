import { motion, AnimatePresence } from 'framer-motion';
import { InviteType } from '../constants';
import { useInviteGenerator } from '../hooks/useInviteGenerator';
import { GeneratedLink } from '@/components/invites/GeneratedLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Users, Star } from 'lucide-react';

const Card = ({ children, selected, onClick }: { children: React.ReactNode, selected: boolean, onClick: () => void }) => (
  <motion.div
    onClick={onClick}
    className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all duration-300 ${selected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
    whileHover={{ scale: 1.03 }}
  >
    {children}
  </motion.div>
);

const InviteVariation4 = () => {
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
      <div className="text-center mb-6">
        <h3 className="font-bold text-xl">Choose Your Invite Method</h3>
        <p className="text-gray-500">How do you want to share Voces?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card selected={inviteType === InviteType.General} onClick={() => setInviteType(InviteType.General)}>
          <Users className="mx-auto mb-3 text-purple-500" size={32} />
          <h4 className="font-semibold">Public Invite</h4>
          <p className="text-sm text-gray-500">A single link for anyone to use.</p>
        </Card>
        <Card selected={inviteType === InviteType.Personalized} onClick={() => setInviteType(InviteType.Personalized)}>
          <Mail className="mx-auto mb-3 text-blue-500" size={32} />
          <h4 className="font-semibold">Personal Invite</h4>
          <p className="text-sm text-gray-500">A special link for one person.</p>
        </Card>
      </div>

      <AnimatePresence>
        {inviteType === InviteType.Personalized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-neutral-50 rounded-xl space-y-4 mb-6"
          >
            <h4 className="font-semibold text-lg text-center">Make it Special ✨</h4>
            <Input placeholder="Invitee's Name" value={name} onChange={e => setName(e.target.value)} />
            <Textarea placeholder="Add a personal note..." value={message} onChange={e => setMessage(e.target.value)} />
            <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 bg-white border rounded-lg">
                <Star className="text-yellow-400" />
                <span>A personal touch makes all the difference!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Invite Link
      </Button>
    </div>
  );
};

export default InviteVariation4;