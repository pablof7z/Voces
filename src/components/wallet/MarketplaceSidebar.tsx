import { motion } from 'framer-motion';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '@/features/classifieds/hooks/useListings';

export function MarketplaceSidebar() {
  const navigate = useNavigate();
  const { listings } = useListings({});
  const recentListings = listings.slice(0, 5);

  return (
    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">
            Recent Marketplace
          </h3>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          View All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {recentListings.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-500">
            No marketplace items yet
          </div>
        ) : (
          recentListings.map((listing) => (
            <motion.div
              key={listing.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/marketplace/${listing.encode()}`)}
              className="bg-neutral-800/30 rounded-lg p-3 cursor-pointer transition-all hover:bg-neutral-800/50"
            >
              <div className="flex gap-3">
                {listing.image && (
                  <div className="w-12 h-12 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {listing.title}
                  </h4>
                  {listing.price && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {listing.price.amount} {listing.price.currency || 'sats'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}