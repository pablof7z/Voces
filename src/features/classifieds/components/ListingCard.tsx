import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { ClassifiedListing } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ListingCardProps {
  listing: ClassifiedListing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images?.[0];
  const timeAgo = listing.publishedAt
    ? formatDistanceToNow(new Date(listing.publishedAt * 1000), { addSuffix: true })
    : 'recently';

  return (
    <Link to={`/marketplace/${listing.id}`}>
      <Card className="hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full overflow-hidden group bg-white dark:bg-black/50 border-gray-100 dark:border-gray-800/50 animate-fade-in">
        {/* Image Section */}
        <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
          {mainImage ? (
            <>
              <img
                src={mainImage}
                alt={listing.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {listing.status === 'sold' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-xl rotate-12 border-4 border-white px-3 py-1 rounded">
                    SOLD
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Price - Most prominent */}
          {listing.price && (
            <div className="flex justify-between items-start">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.price.currency === 'SATS' ? (
                  <span className="text-orange-500">{listing.price.amount} SATS</span>
                ) : (
                  <span>
                    {listing.price.currency === 'USD' && '$'}
                    {listing.price.currency === 'EUR' && '€'}
                    {listing.price.currency === 'GBP' && '£'}
                    {listing.price.amount}
                    {!['USD', 'EUR', 'GBP'].includes(listing.price.currency) && ` ${listing.price.currency}`}
                  </span>
                )}
                {listing.price.frequency && listing.price.frequency !== 'once' && (
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /{listing.price.frequency}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {listing.title}
          </h3>

          {/* Summary - if exists */}
          {listing.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {listing.summary}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
            {listing.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{listing.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <UserAvatar pubkey={listing.author} size="xs" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Posted by
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}