import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Tag, Share2, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { PriceTag } from '@/features/classifieds/components/PriceTag';
import { useSubscribe, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { CLASSIFIED_LISTING_KIND, parseListingFromEvent } from '@/features/classifieds/types';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useCreateListing } from '@/features/classifieds/hooks/useCreateListing';
import { useState } from 'react';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useNDKCurrentUser();
  const { deleteListing } = useCreateListing();
  const [isDeleting, setIsDeleting] = useState(false);

  const { events, eose } = useSubscribe(id ? [{
    ids: [id],
    kinds: [CLASSIFIED_LISTING_KIND]
  }] : false, { subId: 'listing-detail' });

  if (!eose && events.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
        </div>
      </div>
    );
  }

  const event = events[0];
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Listing Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This listing may have been removed or doesn&apos;t exist.
          </p>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const listing = parseListingFromEvent(event);
  const isOwner = currentUser?.pubkey === listing.author;
  const timeAgo = listing.publishedAt
    ? formatDistanceToNow(new Date(listing.publishedAt * 1000), { addSuffix: true })
    : 'recently';

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      setIsDeleting(true);
      await deleteListing(listing.id);
      navigate('/marketplace');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert('Failed to delete listing. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/marketplace')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {listing.images && listing.images.length > 0 && (
              <div className="mb-6">
                <div className="grid gap-4">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full rounded-lg object-cover aspect-video"
                  />
                  {listing.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {listing.images.slice(1).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${listing.title} ${index + 2}`}
                          className="w-full h-24 rounded-lg object-cover cursor-pointer hover:opacity-75"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {listing.title}
                    </h1>
                    {listing.price && (
                      <PriceTag price={listing.price} className="text-lg px-4 py-2" />
                    )}
                  </div>

                  {listing.status === 'sold' && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg text-center font-semibold">
                      This item has been sold
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {listing.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Posted {timeAgo}</span>
                    </div>
                  </div>

                  {listing.categories && listing.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {listing.categories.map(category => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <div className="whitespace-pre-wrap">{listing.content}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <UserAvatar pubkey={listing.author} size="lg" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Listed by</p>
                    <p className="font-medium">User</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {isOwner ? (
                    <>
                      <Link to={`/marketplace/edit/${listing.id}`} className="block">
                        <Button className="w-full" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Listing
                        </Button>
                      </Link>
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? 'Deleting...' : 'Delete Listing'}
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Seller
                    </Button>
                  )}

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}