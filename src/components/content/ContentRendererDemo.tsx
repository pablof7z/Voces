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

Custom emoji: Hello :gleasonator: 😂 :ablobcatrainbow: :disputed: yolo
`;

  // NIP-30 custom emoji tags
  const sampleEmojiTags = [
    ['emoji', 'ablobcatrainbow', 'https://gleasonator.com/emoji/blobcat/ablobcatrainbow.png'],
    ['emoji', 'disputed', 'https://gleasonator.com/emoji/Fun/disputed.png'],
    ['emoji', 'gleasonator', 'https://gleasonator.com/emoji/Gleasonator/gleasonator.png']
  ];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Content Renderer Demo</h2>
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Without Custom Emoji</h3>
          <ContentRenderer content={sampleContent} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">With NIP-30 Custom Emoji</h3>
          <ContentRenderer content={sampleContent} emojiTags={sampleEmojiTags} />
        </div>
      </div>
    </div>
  );
}