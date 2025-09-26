import { ContentRenderer } from './ContentRenderer';

export function ContentRendererDemo() {
  const sampleContent = `
Check out this image: https://nostr.build/i/example.jpg

Here's a YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ

Mentioned user: nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft

A quoted note: nostr:note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq

Regular link: https://github.com/nostr-protocol/nips

Some audio: https://example.com/podcast.mp3

And a video: https://example.com/video.mp4
`;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Content Renderer Demo</h2>
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
        <ContentRenderer content={sampleContent} />
      </div>
    </div>
  );
}