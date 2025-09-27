import { motion } from 'framer-motion';
import { Plus, Edit3, TrendingUp, ShoppingBag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CreateOrderModal } from '@/features/trades/CreateOrderModal';
import { useNavigate } from 'react-router-dom';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

interface FABProps {
  className?: string;
  icon?: 'plus' | 'edit';
}

export function FAB({ className }: FABProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useNDKCurrentUser();
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);

  // Determine FAB action and icon based on current route
  const getFABConfig = () => {
    const path = location.pathname;

    if (path.startsWith('/trades')) {
      return {
        icon: TrendingUp,
        label: 'Create Trade',
        action: () => setShowCreateOrderModal(true),
        requiresAuth: true
      };
    }

    if (path.startsWith('/marketplace')) {
      return {
        icon: ShoppingBag,
        label: 'List Item',
        action: () => navigate('/marketplace/create'),
        requiresAuth: true
      };
    }

    if (path.startsWith('/money')) {
      return {
        icon: Plus,
        label: 'Add Funds',
        action: () => {},
        requiresAuth: false
      };
    }

    // Default to compose for feed/home
    return {
      icon: Edit3,
      label: 'Compose',
      action: () => navigate('/compose'),
      requiresAuth: true
    };
  };

  const config = getFABConfig();
  const Icon = config.icon;

  // Don't show FAB if auth is required but user not logged in
  if (config.requiresAuth && !currentUser) {
    return null;
  }

  const handleClick = () => {
    config.action();
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "fixed bottom-20 right-4 z-40",
          "w-14 h-14 rounded-full",
          "bg-black dark:bg-white",
          "shadow-lg shadow-black/25 dark:shadow-white/10",
          "flex items-center justify-center",
          "md:hidden", // Only show on mobile
          className
        )}
        aria-label={config.label}
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.button>

      {/* Modal for trades page */}
      {showCreateOrderModal && (
        <CreateOrderModal onClose={() => setShowCreateOrderModal(false)} />
      )}
    </>
  );
}