import React from 'react';
import { MOCK_INTRO_POSTS, MOCK_INVITER } from '@/features/invites/constants';
import { Textarea } from '@/components/ui/textarea';
import { Zap, MessageSquare } from 'lucide-react';

interface ExamplePostCardProps {
    post: typeof MOCK_INTRO_POSTS[0];
}

const ExamplePostCard: React.FC<ExamplePostCardProps> = ({ post }) => (
    <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
            <img src={post.author.picture} alt={post.author.name} className="w-10 h-10 rounded-full mr-3" />
            <div>
                <p className="font-bold">{post.author.name}</p>
                <p className="text-sm text-gray-500">@{post.author.nip05}</p>
            </div>
        </div>
        <p className="text-gray-700 mb-3">{post.content}</p>
        <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center mr-4">
                <Zap size={16} className="text-yellow-500 mr-1" /> {post.zaps}
            </div>
            <div className="flex items-center">
                <MessageSquare size={16} className="mr-1" /> {post.replies}
            </div>
        </div>
    </div>
);

interface GuidedIntroPostProps {
  introPost: string;
  setIntroPost: (post: string) => void;
}

export function GuidedIntroPost({ introPost, setIntroPost }: GuidedIntroPostProps) {
  
  const initialPostContent = `Hey everyone! Just joined Voces, thanks to @${MOCK_INVITER.nip05} for the invite! Looking forward to connecting. #introductions`;

  React.useEffect(() => {
    if (!introPost) {
      setIntroPost(initialPostContent);
    }
  }, [introPost, setIntroPost, initialPostContent]);

  return (
    <div>
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-center">Introduce Yourself!</h3>
            <p className="text-gray-600 text-center mb-4">Create your first post. Here are some great examples from the community:</p>
            <div className="max-h-60 overflow-y-auto p-1">
              {MOCK_INTRO_POSTS.map(post => <ExamplePostCard key={post.id} post={post} />)}
            </div>
        </div>
        <Textarea
            value={introPost}
            onChange={(e) => setIntroPost(e.target.value)}
            className="min-h-[120px] text-base"
            placeholder="Share something about yourself..."
        />
        <p className="text-xs text-gray-500 mt-2">Your inviter will be tagged automatically so they can welcome you!</p>
    </div>
  );
}