import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Crown, ArrowRight, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_INVITER, ONBOARDING_SCENARIOS } from '@/mocks/inviteMock';

const SCENARIO = ONBOARDING_SCENARIOS.scenario6;

type Step = 'welcome' | 'profile' | 'complete';

function InviteOnboarding6() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [name, setName] = useState(SCENARIO.decryptedPayload?.name || '');
  const [about, setAbout] = useState('');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sophisticated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-black to-orange-950/20" />
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundImage: [
              'radial-gradient(circle at 0% 0%, #fbbf24 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, #a855f7 0%, transparent 50%)',
              'radial-gradient(circle at 0% 100%, #fbbf24 0%, transparent 50%)',
              'radial-gradient(circle at 100% 0%, #a855f7 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, #fbbf24 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {currentStep === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl border border-amber-500/30 rounded-full">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-amber-100 text-sm font-medium tracking-wide uppercase">
                  Exclusive Invitation
                </span>
              </div>
            </motion.div>

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl"
            >
              {/* Inviter Section */}
              <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <UserAvatar
                    pubkey={MOCK_INVITER.pubkey}
                    size="xl"
                    className="ring-2 ring-amber-500/50 ring-offset-4 ring-offset-black"
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                </motion.div>
                <div>
                  <p className="text-amber-400/80 text-sm mb-1 tracking-wide uppercase">
                    Invited by
                  </p>
                  <p className="text-white text-2xl font-bold mb-1">
                    {MOCK_INVITER.name}
                  </p>
                  <p className="text-neutral-500 text-sm">
                    Curator & Community Leader
                  </p>
                </div>
              </div>

              {/* Voces Branding */}
              <div className="text-center mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-6xl font-serif font-black text-transparent bg-gradient-to-r from-amber-200 via-white to-orange-200 bg-clip-text mb-4 tracking-tight"
                >
                  Voces
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-neutral-400 text-lg leading-relaxed max-w-lg mx-auto"
                >
                  {SCENARIO.welcomeMessage}
                </motion.p>
              </div>

              {/* Personalized Message */}
              {SCENARIO.decryptedPayload && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="relative p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20 mb-8"
                >
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-amber-400 text-sm font-medium mb-3 tracking-wide uppercase">
                    For {SCENARIO.decryptedPayload.name}
                  </p>
                  <p className="text-neutral-200 text-lg leading-relaxed">
                    {SCENARIO.decryptedPayload.message}
                  </p>
                </motion.div>
              )}

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                {[
                  { label: 'Curated Network', value: '100%' },
                  { label: 'Privacy First', value: 'Always' },
                  { label: 'Your Data', value: 'Yours' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="text-center p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <p className="text-2xl font-bold text-white mb-1">{item.value}</p>
                    <p className="text-neutral-500 text-xs">{item.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <Button
                  onClick={() => setCurrentStep('profile')}
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-black rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Accept Invitation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-center text-xs text-neutral-600 mt-4">
                  By continuing, you agree to join the Voces community
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {currentStep === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Complete Your Profile
              </h2>
              <p className="text-neutral-400">
                Make your mark on Voces
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-white font-medium">
                  Display Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-white/5 border-white/20 text-white placeholder:text-neutral-600 focus:border-amber-500/50"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium">
                  About You
                </label>
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-neutral-600 resize-none focus:border-amber-500/50"
                  placeholder="Share your story..."
                />
              </div>

              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-sm text-amber-200/90 leading-relaxed">
                  You&apos;ll be connected to {MOCK_INVITER.name}&apos;s curated network and inherit their trusted wallet configuration.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('welcome')}
                className="flex-1 h-12 border-white/20 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep('complete')}
                disabled={!name}
                className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-10"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1.2, bounce: 0.4 }}
              className="relative"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/40">
                <Check className="w-16 h-16 text-white" />
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-amber-500 rounded-full blur-3xl"
              />
            </motion.div>

            {/* Message */}
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl font-serif font-black text-white mb-3"
              >
                Welcome, {name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl text-neutral-400"
              >
                Your exclusive access is now active
              </motion.p>
            </div>

            {/* Status Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="max-w-lg mx-auto space-y-3"
            >
              {[
                { label: 'Identity Verified', icon: Check, color: 'from-green-400 to-emerald-500' },
                { label: 'Network Connected', icon: Check, color: 'from-blue-400 to-blue-500' },
                { label: 'Wallet Configured', icon: Check, color: 'from-orange-500 to-orange-500' },
                { label: 'Premium Features Unlocked', icon: Crown, color: 'from-amber-400 to-orange-500' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <Button
                onClick={() => navigate('/')}
                className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-600 hover:via-amber-500 hover:to-orange-600 text-black rounded-xl shadow-2xl shadow-amber-500/30"
              >
                Enter Voces
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              {SCENARIO.decryptedPayload?.cashu && (
                <p className="text-amber-400/80 text-sm mt-4">
                  Your welcome gift of sats is waiting in your wallet
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default InviteOnboarding6;