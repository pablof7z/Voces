import { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_SERVERS = [
  'https://blossom.primal.net',
  'https://blossom.nostr.hu',
  'https://blossom.oxtr.dev'
];

export function BlossomSettings() {
  const [servers, setServers] = useState<string[]>([]);
  const [newServer, setNewServer] = useState('');
  const [isAddingServer, setIsAddingServer] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('blossomServers');
    if (stored) {
      try {
        setServers(JSON.parse(stored));
      } catch {
        setServers([DEFAULT_SERVERS[0]]);
      }
    } else {
      setServers([DEFAULT_SERVERS[0]]);
    }
  }, []);

  const saveServers = (newServers: string[]) => {
    setServers(newServers);
    localStorage.setItem('blossomServers', JSON.stringify(newServers));
  };

  const addServer = () => {
    if (!newServer.trim()) return;

    try {
      const url = new URL(newServer.trim());
      if (!url.protocol.startsWith('http')) {
        alert('Please enter a valid HTTP or HTTPS URL');
        return;
      }

      const cleanUrl = url.origin + url.pathname.replace(/\/$/, '');

      if (servers.includes(cleanUrl)) {
        alert('This server is already in your list');
        return;
      }

      saveServers([...servers, cleanUrl]);
      setNewServer('');
      setIsAddingServer(false);
    } catch {
      alert('Please enter a valid URL');
    }
  };

  const removeServer = (serverToRemove: string) => {
    if (servers.length === 1) {
      alert('You must have at least one Blossom server');
      return;
    }
    saveServers(servers.filter(s => s !== serverToRemove));
  };

  const moveServerUp = (index: number) => {
    if (index === 0) return;
    const newServers = [...servers];
    [newServers[index - 1], newServers[index]] = [newServers[index], newServers[index - 1]];
    saveServers(newServers);
  };

  const moveServerDown = (index: number) => {
    if (index === servers.length - 1) return;
    const newServers = [...servers];
    [newServers[index], newServers[index + 1]] = [newServers[index + 1], newServers[index]];
    saveServers(newServers);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Blossom Media Servers</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Configure your Blossom servers for uploading images and media. The first server is your primary upload destination, and additional servers are used as mirrors for redundancy.
        </p>
      </div>

      {/* Current servers */}
      <div className="space-y-3">
        <Label>Your Blossom Servers</Label>
        <div className="space-y-2">
          {servers.map((server, index) => (
            <div
              key={server}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveServerUp(index)}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                    aria-label="Move up"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveServerDown(index)}
                    disabled={index === servers.length - 1}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                    aria-label="Move down"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{server}</span>
                    {index === 0 && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <a
                    href={server}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 flex items-center space-x-1"
                  >
                    <span>Visit server</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              {servers.length > 1 && (
                <button
                  onClick={() => removeServer(server)}
                  className="text-red-500 hover:text-red-600 p-2"
                  aria-label="Remove server"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add server */}
      {isAddingServer ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <Label htmlFor="new-server">Add Blossom Server</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              id="new-server"
              value={newServer}
              onChange={(e) => setNewServer(e.target.value)}
              placeholder="https://blossom.example.com"
              onKeyPress={(e) => e.key === 'Enter' && addServer()}
            />
            <button
              onClick={addServer}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingServer(false);
                setNewServer('');
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingServer(true)}
          className="flex items-center space-x-2 px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Server</span>
        </button>
      )}

      {/* Suggested servers */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <Label>Suggested Servers</Label>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Popular public Blossom servers you can add to your list
        </p>
        <div className="space-y-2">
          {DEFAULT_SERVERS.filter(s => !servers.includes(s)).map(server => (
            <div
              key={server}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-black rounded-lg"
            >
              <span className="text-sm">{server}</span>
              <button
                onClick={() => saveServers([...servers, server])}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                Add
              </button>
            </div>
          ))}
          {DEFAULT_SERVERS.every(s => servers.includes(s)) && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All suggested servers have been added
            </p>
          )}
        </div>
      </div>
    </div>
  );
}