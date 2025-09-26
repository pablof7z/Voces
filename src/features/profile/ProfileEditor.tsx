import { useState, useRef } from 'react';
import { useNDK, useProfile } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import { BlossomClient } from 'blossom-client-sdk';
import { X, Upload, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileEditorProps {
  pubkey: string;
  onClose: () => void;
  onSave: () => void;
}

export function ProfileEditor({ pubkey, onClose, onSave }: ProfileEditorProps) {
  const ndk = useNDK();
  const profile = useProfile(pubkey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    displayName: profile?.displayName || '',
    about: profile?.about || '',
    picture: profile?.picture || '',
    banner: profile?.banner || '',
    nip05: profile?.nip05 || '',
    lud16: profile?.lud16 || '',
    website: profile?.website || ''
  });

  const getBlossomServers = () => {
    const stored = localStorage.getItem('blossomServers');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Failed to parse stored blossom servers, fall back to default
      }
    }
    return ['https://blossom.primal.net'];
  };

  const uploadToBlossoms = async (file: File): Promise<string> => {
    const servers = getBlossomServers();
    const mainServer = servers[0];

    const auth = await BlossomClient.createUploadAuth(file, async (event) => {
      const ndkEvent = new NDKEvent(ndk.ndk);
      ndkEvent.kind = event.kind;
      ndkEvent.content = event.content;
      ndkEvent.tags = event.tags;
      ndkEvent.created_at = event.created_at;
      await ndkEvent.sign();
      return ndkEvent.rawEvent();
    });

    const blob = await BlossomClient.uploadBlob(mainServer, file, auth);

    // Mirror to other servers if available
    for (let i = 1; i < servers.length; i++) {
      try {
        await BlossomClient.mirrorBlob(servers[i], blob.url, auth);
      } catch (error) {
        console.error(`Failed to mirror to ${servers[i]}:`, error);
      }
    }

    return blob.url;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'picture' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToBlossoms(file);
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please check your Blossom server settings.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!ndk.ndk.signer) {
      alert('Please connect your wallet to save changes');
      return;
    }

    setIsSubmitting(true);
    try {
      const event = new NDKEvent(ndk.ndk);
      event.kind = NDKKind.Metadata;
      event.content = JSON.stringify({
        name: formData.name,
        display_name: formData.displayName,
        about: formData.about,
        picture: formData.picture,
        banner: formData.banner,
        nip05: formData.nip05,
        lud16: formData.lud16,
        website: formData.website
      });

      await event.sign();
      await event.publish();

      onSave();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-950 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Banner */}
          <div>
            <Label>Banner</Label>
            <div className="mt-2">
              <div
                className="h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg relative overflow-hidden cursor-pointer group"
                onClick={() => bannerInputRef.current?.click()}
                style={formData.banner ? { backgroundImage: `url(${formData.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'banner')}
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <Label>Profile Picture</Label>
            <div className="mt-2">
              <div className="flex items-center space-x-4">
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.picture ? (
                    <img src={formData.picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                      {formData.name ? formData.name[0].toUpperCase() : 'A'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'picture')}
                    disabled={isUploading}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Or enter image URL"
                    value={formData.picture}
                    onChange={(e) => setFormData(prev => ({ ...prev, picture: e.target.value }))}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Satoshi Nakamoto"
              className="mt-2"
            />
          </div>

          {/* Display Name */}
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Optional display name"
              className="mt-2"
            />
          </div>

          {/* About - WYSIWYG */}
          <div>
            <Label htmlFor="about">About</Label>
            <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                <button
                  type="button"
                  className="px-2 py-1 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  onClick={() => {
                    const textarea = document.getElementById('about') as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = formData.about;
                    const selectedText = text.substring(start, end);
                    const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                    setFormData(prev => ({ ...prev, about: newText }));
                  }}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded italic"
                  onClick={() => {
                    const textarea = document.getElementById('about') as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = formData.about;
                    const selectedText = text.substring(start, end);
                    const newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                    setFormData(prev => ({ ...prev, about: newText }));
                  }}
                >
                  <em>I</em>
                </button>
              </div>
              <Textarea
                id="about"
                value={formData.about}
                onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="border-0 focus:ring-0 min-h-[120px]"
                rows={5}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supports markdown formatting
            </p>
          </div>

          {/* NIP-05 */}
          <div>
            <Label htmlFor="nip05">NIP-05 Identifier</Label>
            <Input
              id="nip05"
              value={formData.nip05}
              onChange={(e) => setFormData(prev => ({ ...prev, nip05: e.target.value }))}
              placeholder="name@domain.com"
              className="mt-2"
            />
          </div>

          {/* Lightning Address */}
          <div>
            <Label htmlFor="lud16">Lightning Address</Label>
            <Input
              id="lud16"
              value={formData.lud16}
              onChange={(e) => setFormData(prev => ({ ...prev, lud16: e.target.value }))}
              placeholder="name@walletofsatoshi.com"
              className="mt-2"
            />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://example.com"
              className="mt-2"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}