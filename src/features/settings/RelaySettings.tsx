import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Check,
  Zap,
  BookOpen,
  Edit2,
  Globe,
  AlertCircle,
  Wifi,
  Shield,
  Server,
  MapPin,
  Info
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { useRelayInfoCached } from '@/hooks/useRelayInfo';

export function RelaySettings() {
  const { relays, addRelay, removeRelay, updateRelay, toggleRelay } = useSettingsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newRelay, setNewRelay] = useState({ url: '', read: true, write: true });
  const [testingRelay, setTestingRelay] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'disconnected' | 'testing'>>({});

  const handleAddRelay = () => {
    if (newRelay.url && !relays.some(r => r.url === newRelay.url)) {
      addRelay({
        ...newRelay,
        enabled: true,
        url: newRelay.url.startsWith('wss://') ? newRelay.url : `wss://${newRelay.url}`,
      });
      setNewRelay({ url: '', read: true, write: true });
      setIsAdding(false);
    }
  };

  const testRelayConnection = async (url: string) => {
    setTestingRelay(url);
    setConnectionStatus(prev => ({ ...prev, [url]: 'testing' }));

    // Mock connection test
    setTimeout(() => {
      const isConnected = Math.random() > 0.3; // 70% success rate for demo
      setConnectionStatus(prev => ({
        ...prev,
        [url]: isConnected ? 'connected' : 'disconnected'
      }));
      setTestingRelay(null);
    }, 1500);
  };

  const getRelayStatus = (url: string) => {
    if (testingRelay === url) return 'testing';
    return connectionStatus[url] || 'disconnected';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Relay Configuration
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure which Nostr relays your app connects to for reading and publishing events.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="bg-neutral-50 dark:bg-black rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-1 md:gap-2 text-green-600 dark:text-green-400 mb-1">
            <Wifi className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">Active</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {relays.filter(r => r.enabled).length}
          </div>
        </div>
        <div className="bg-neutral-50 dark:bg-black rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-1 md:gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">Read</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {relays.filter(r => r.enabled && r.read).length}
          </div>
        </div>
        <div className="bg-neutral-50 dark:bg-black rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-1 md:gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm font-medium">Write</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {relays.filter(r => r.enabled && r.write).length}
          </div>
        </div>
      </div>

      {/* Relay List */}
      <div className="space-y-2">
        <AnimatePresence>
          {relays.map((relay) => {
            const status = getRelayStatus(relay.url);
            return (
              <motion.div
                key={relay.url}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  'border rounded-lg p-4 transition-all',
                  relay.enabled
                    ? 'bg-white dark:bg-black border-gray-200 dark:border-gray-700'
                    : 'bg-neutral-50 dark:bg-black border-gray-200 dark:border-gray-800 opacity-60'
                )}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-start md:items-center gap-3">
                      <button
                        onClick={() => toggleRelay(relay.url)}
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 md:mt-0',
                          relay.enabled
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white dark:bg-black border-gray-300 dark:border-gray-600'
                        )}
                      >
                        {relay.enabled && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <RelayDetails
                        relay={relay}
                        status={status}
                        connectionStatus={connectionStatus}
                        onUpdateRelay={updateRelay}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-8 md:ml-0">
                    <button
                      onClick={() => testRelayConnection(relay.url)}
                      disabled={testingRelay === relay.url}
                      className="p-1.5 md:p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors disabled:opacity-50"
                      title="Test connection"
                    >
                      <Zap className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => removeRelay(relay.url)}
                      className="p-1.5 md:p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors group"
                      title="Remove relay"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add New Relay */}
        <AnimatePresence>
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-4"
            >
              <div className="space-y-3">
                <input
                  type="text"
                  value={newRelay.url}
                  onChange={(e) => setNewRelay({ ...newRelay, url: e.target.value })}
                  placeholder="wss://relay.example.com"
                  className="w-full px-3 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRelay.read}
                      onChange={(e) => setNewRelay({ ...newRelay, read: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Read</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRelay.write}
                      onChange={(e) => setNewRelay({ ...newRelay, write: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Write</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRelay}
                    disabled={!newRelay.url}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Relay
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewRelay({ url: '', read: true, write: true });
                    }}
                    className="px-4 py-2 bg-neutral-200 dark:bg-black text-gray-700 dark:text-gray-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-900 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsAdding(true)}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:border-purple-400 dark:hover:border-purple-600 transition-colors group"
            >
              <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Relay</span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <p className="font-medium mb-1">Important</p>
            <p>Changes to relay configuration will take effect after refreshing the app.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Relay details component with NIP-11 info
function RelayDetails({
  relay,
  status,
  connectionStatus,
  onUpdateRelay
}: {
  relay: { url: string; read: boolean; write: boolean };
  status: string;
  connectionStatus: Record<string, string>;
  onUpdateRelay: (url: string, updates: any) => void;
}) {
  const { info } = useRelayInfoCached(relay.url);

  // Get relay icon based on features
  const getRelayIcon = () => {
    if (info?.limitation?.payment_required) return <Zap className="w-4 h-4 text-yellow-500" />;
    if (info?.limitation?.auth_required) return <Shield className="w-4 h-4 text-blue-500" />;
    if (info?.software) return <Server className="w-4 h-4 text-purple-500" />;
    return <Globe className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        {getRelayIcon()}
        <span className="font-mono text-xs md:text-sm text-gray-900 dark:text-gray-100 break-all">
          {relay.url}
        </span>
        {status === 'connected' && (
          <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
            Connected
          </span>
        )}
        {status === 'disconnected' && connectionStatus[relay.url] !== undefined && (
          <span className="text-xs bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
            Offline
          </span>
        )}
        {status === 'testing' && (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
            Testing...
          </span>
        )}
      </div>

      {/* NIP-11 Info Display */}
      {info && (
        <div className="mt-2 space-y-1">
          {info.name && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[60px]">Name:</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{info.name}</span>
            </div>
          )}

          {info.description && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[60px]">About:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{info.description}</span>
            </div>
          )}

          {(info.software || info.version) && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[60px]">Software:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {info.software}{info.version ? ` v${info.version}` : ''}
              </span>
            </div>
          )}

          {info.relay_countries && info.relay_countries.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {info.relay_countries.join(', ')}
              </span>
            </div>
          )}

          {info.supported_nips && info.supported_nips.length > 0 && (
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Supports {info.supported_nips.length} NIPs: {info.supported_nips.slice(0, 5).join(', ')}
                  {info.supported_nips.length > 5 && '...'}
                </span>
              </div>
            </div>
          )}

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {info.limitation?.payment_required && (
              <span className="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                💰 Paid
              </span>
            )}
            {info.limitation?.auth_required && (
              <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                🔐 Auth Required
              </span>
            )}
            {info.contact && (
              <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full">
                📧 {info.contact}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Read/Write toggles */}
      <div className="flex items-center gap-4 mt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={relay.read}
            onChange={(e) => onUpdateRelay(relay.url, { read: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Read
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={relay.write}
            onChange={(e) => onUpdateRelay(relay.url, { write: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Write
          </span>
        </label>
      </div>
    </div>
  );
}