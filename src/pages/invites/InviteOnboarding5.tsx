import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Check, Star, Users, MessageCircle, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { MOCK_INVITER, ONBOARDING_SCENARIOS } from '@/mocks/inviteMock';

const SCENARIO = ONBOARDING_SCENARIOS.scenario5;

type Card = 'intro' | 'why' | 'setup' | 'ready';

function InviteOnboarding5() {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState<Card>('intro');
  const [name, setName] = useState(SCENARIO.decryptedPayload?.name || '');
  const [about, setAbout] = useState('');

  const cardIndex = ['intro', 'why', 'setup', 'ready'].indexOf(currentCard);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-red-50 to-pink-50 dark:from-gray-950 dark:via-orange-950/20 dark:to-pink-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card Stack Indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {['intro', 'why', 'setup', 'ready'].map((card, index) => (
            <div
              key={card}
              className={`h-1.5 rounded-full transition-all ${
                index <= cardIndex
                  ? 'w-12 bg-gradient-to-r from-orange-500 to-pink-500'
                  : 'w-8 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentCard === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-black rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Card Header with gradient */}
              <div className="h-40 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 relative overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <UserAvatar
                      pubkey={MOCK_INVITER.pubkey}
                      size="xl"
                      className="ring-4 ring-white shadow-2xl"
                    />
                  </motion.div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-orange-500 dark:text-orange-400 font-semibold mb-2">
                    {MOCK_INVITER.name} invited you to join
                  </p>
                  <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text mb-4">
                    Voces
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {SCENARIO.welcomeMessage}
                  </p>
                </div>

                {SCENARIO.decryptedPayload && (
                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/30 rounded-2xl p-6 border-2 border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-white fill-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white mb-2">
                          Hey {SCENARIO.decryptedPayload.name}! 👋
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {SCENARIO.decryptedPayload.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setCurrentCard('why')}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentCard === 'why' && (
            <motion.div
              key="why"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-black rounded-3xl shadow-2xl p-8 md:p-12 space-y-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                  Why Voces?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Here&apos;s what makes us different
                </p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    icon: MessageCircle,
                    title: 'Own Your Voice',
                    description: 'Your posts, your data. No corporate overlords.',
                    color: 'from-blue-500 to-blue-600',
                  },
                  {
                    icon: Users,
                    title: 'Real Connections',
                    description: 'Build genuine relationships without the noise.',
                    color: 'from-purple-500 to-purple-600',
                  },
                  {
                    icon: Coins,
                    title: 'Earn & Support',
                    description: 'Send and receive value directly, no middlemen.',
                    color: 'from-orange-500 to-pink-500',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition-shadow"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={() => setCurrentCard('setup')}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl"
              >
                I&apos;m Ready!
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {currentCard === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-black rounded-3xl shadow-2xl p-8 md:p-12 space-y-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                  Let&apos;s Set You Up
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Just a couple quick details
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-gray-900 dark:text-white font-semibold text-base">
                    What should we call you?
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-lg"
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-900 dark:text-white font-semibold text-base">
                    Tell us about yourself
                  </label>
                  <Textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="min-h-[100px] text-base resize-none"
                    placeholder="I'm passionate about..."
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    This helps others connect with you
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/30 rounded-xl border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                    We&apos;re copying {MOCK_INVITER.name}&apos;s follows and wallet settings
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setCurrentCard('ready')}
                disabled={!name}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl"
              >
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {currentCard === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-black rounded-3xl shadow-2xl p-8 md:p-12 text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 1 }}
              >
                <div className="w-28 h-28 mx-auto bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                  >
                    <Star className="w-14 h-14 text-white fill-white" />
                  </motion.div>
                </div>
              </motion.div>

              <div>
                <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
                  You&apos;re In! 🎉
                </h2>
                <p className="text-2xl text-gray-600 dark:text-gray-400 mb-2">
                  Welcome, {name}
                </p>
                <p className="text-gray-500 dark:text-gray-500">
                  Your decentralized journey begins now
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {[
                  { icon: Check, label: 'Account Created', bg: 'from-green-400 to-emerald-500' },
                  { icon: Users, label: 'Network Ready', bg: 'from-blue-400 to-blue-500' },
                  { icon: MessageCircle, label: 'Ready to Post', bg: 'from-purple-400 to-purple-500' },
                  { icon: Coins, label: 'Wallet Active', bg: 'from-orange-400 to-pink-500' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl"
                  >
                    <div className={`w-10 h-10 mx-auto bg-gradient-to-br ${item.bg} rounded-xl flex items-center justify-center mb-2 shadow-md`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={() => navigate('/')}
                  className="w-full h-16 text-xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white rounded-2xl shadow-xl shadow-pink-500/30"
                >
                  Start Exploring
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </motion.div>

              <p className="text-sm text-gray-500 dark:text-gray-500">
                {SCENARIO.decryptedPayload?.cashu && '🎁 Your welcome sats are already in your wallet!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InviteOnboarding5;