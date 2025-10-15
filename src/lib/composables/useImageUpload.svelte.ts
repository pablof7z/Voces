import { NDKBlossom } from '@nostr-dev-kit/blossom';
import { useBlossomUpload } from '@nostr-dev-kit/svelte';
import { toast } from '$lib/stores/toast.svelte';
import type NDK from '@nostr-dev-kit/ndk';

export interface UploadedImage {
  url: string;
  mimeType: string;
  hash: string;
  blurhash?: string;
  dimensions?: { width: number; height: number };
}

export interface UseImageUploadOptions {
  fallbackServer?: string;
}

export function useImageUpload(ndk: NDK, options: UseImageUploadOptions = {}) {
  const blossom = new NDKBlossom(ndk);
  const upload = useBlossomUpload(blossom);

  let uploadedImages = $state<UploadedImage[]>([]);
  let currentImageIndex = $state(0);
  let isDragging = $state(false);

  async function uploadFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      await upload.upload(file, {
        fallbackServer: options.fallbackServer || 'https://blossom.primal.net'
      });

      if (upload.result?.url) {
        // Get image dimensions
        const img = new Image();
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = URL.createObjectURL(file);
        });

        uploadedImages = [...uploadedImages, {
          url: upload.result.url,
          mimeType: file.type,
          hash: upload.result.sha256 || '',
          blurhash: upload.result.blurhash,
          dimensions
        }];

        currentImageIndex = uploadedImages.length - 1;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    }
  }

  function handleFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      Array.from(files).forEach(file => uploadFile(file));
    }
  }

  function handleDragOver(event: DragEvent): void {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(): void {
    isDragging = false;
  }

  async function handleDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      Array.from(files).forEach(file => uploadFile(file));
    }
  }

  function removeImage(index: number): void {
    uploadedImages = uploadedImages.filter((_, i) => i !== index);
    if (currentImageIndex >= uploadedImages.length) {
      currentImageIndex = Math.max(0, uploadedImages.length - 1);
    }
  }

  function reset(): void {
    uploadedImages = [];
    currentImageIndex = 0;
    isDragging = false;
  }

  return {
    get uploadedImages() { return uploadedImages; },
    set uploadedImages(value) { uploadedImages = value; },
    get currentImageIndex() { return currentImageIndex; },
    set currentImageIndex(value) { currentImageIndex = value; },
    get isDragging() { return isDragging; },
    get uploadStatus() { return upload.status; },
    get uploadProgress() { return upload.progress; },
    uploadFile,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
    reset
  };
}
