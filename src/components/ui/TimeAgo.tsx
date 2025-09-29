import { useEffect, useState } from 'react';

interface TimeAgoProps {
  timestamp: number;
  className?: string;
}

export function TimeAgo({ timestamp, className = '' }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = Date.now() / 1000;
      const diff = now - timestamp;

      if (diff < 60) {
        return 'just now';
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes}m`;
      } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours}h`;
      } else if (diff < 604800) {
        const days = Math.floor(diff / 86400);
        return `${days}d`;
      } else if (diff < 2592000) {
        const weeks = Math.floor(diff / 604800);
        return `${weeks}w`;
      } else if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return `${months}mo`;
      } else {
        const years = Math.floor(diff / 31536000);
        return `${years}y`;
      }
    };

    setTimeAgo(calculateTimeAgo());

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo());
    }, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return <span className={className}>{timeAgo}</span>;
}