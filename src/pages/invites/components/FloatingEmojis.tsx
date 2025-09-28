import { motion } from 'framer-motion';

const EMOJIS = ['✨', '💫', '🎉', '⭐', '🌟', '💝'];

export function FloatingEmojis() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl"
          initial={{ y: '100vh', x: Math.random() * window.innerWidth }}
          animate={{
            y: '-10vh',
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          {EMOJIS[i]}
        </motion.div>
      ))}
    </div>
  );
}