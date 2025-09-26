import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingForm } from '@/features/classifieds/components/ListingForm';
import { useCreateListing } from '@/features/classifieds/hooks/useCreateListing';
import type { ListingFormData } from '@/features/classifieds/types';
import { useState } from 'react';

export function CreateListingPage() {
  const navigate = useNavigate();
  const { createListing, isAuthenticated } = useCreateListing();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ListingFormData) => {
    if (!isAuthenticated) {
      alert('Please log in to create a listing');
      return;
    }

    try {
      setIsSubmitting(true);
      await createListing(data);
      navigate('/marketplace');
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to create a listing.
          </p>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/marketplace')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Listing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details below to create your classified listing
          </p>
        </div>

        <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}