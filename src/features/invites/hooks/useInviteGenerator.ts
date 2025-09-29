import { useState, useCallback } from 'react';
import { InviteType } from '../constants';

const generateRandomString = (length: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function useInviteGenerator() {
  const [inviteType, setInviteType] = useState<InviteType>(InviteType.General);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsLoading(true);
    setGeneratedUrl(null);

    setTimeout(() => {
      const dTag = generateRandomString(12);
      let url = `https://voces.xyz/i/${dTag}`;

      if (inviteType === InviteType.Personalized) {
        const key = generateRandomString(24);
        // Append the key directly to the URL after the 12-char dTag
        url = `https://voces.xyz/i/${dTag}${key}`;
      }

      setGeneratedUrl(url);
      setIsLoading(false);
    }, 1000);
  }, [inviteType]);

  const reset = useCallback(() => {
    setGeneratedUrl(null);
    setName('');
    setMessage('');
  }, []);

  return {
    inviteType,
    setInviteType,
    generatedUrl,
    name,
    setName,
    message,
    setMessage,
    isLoading,
    handleGenerate,
    reset,
  };
}