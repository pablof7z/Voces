import { ChevronDown, Globe, Circle, Check, Zap, Shield, Server } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useNavigate } from "react-router-dom";
import { useRelayInfoCached } from "@/hooks/useRelayInfo";

export function RelaySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { relays, selectedRelay, setSelectedRelay } = useSettingsStore();
  const enabledRelays = relays.filter(r => r.enabled);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRelaySelect = (relayUrl: string | null) => {
    setSelectedRelay(relayUrl);
    setIsOpen(false);
  };

  const getRelayDisplayName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("wss://", "").replace("ws://", "");
    } catch {
      return url.replace("wss://", "").replace("ws://", "");
    }
  };

  // Get NIP-11 info for the selected relay to show the relay name if available
  const { info: selectedRelayInfo } = useRelayInfoCached(selectedRelay);

  const currentRelayDisplay = selectedRelay
    ? (selectedRelayInfo?.name || getRelayDisplayName(selectedRelay))
    : "Home";

  // Get the current relay for icon display
  const currentRelay = selectedRelay
    ? relays.find(r => r.url === selectedRelay)
    : null;

  // Get relay icon for header display - similar logic to RelayItem
  const getHeaderRelayIcon = () => {
    if (!selectedRelay) {
      // Home icon for all relays
      return (
        <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <Globe className="h-3.5 w-3.5 text-white" />
        </div>
      );
    }

    if (selectedRelayInfo?.icon) {
      return (
        <img
          src={selectedRelayInfo.icon}
          alt={selectedRelayInfo.name || ''}
          className="w-6 h-6 rounded-lg object-cover"
          onError={(e) => {
            // Hide on error and show default
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    // Use different icons based on relay features
    const iconClass = "h-3.5 w-3.5";
    let icon;
    let bgColor;

    if (selectedRelayInfo?.limitation?.payment_required) {
      icon = <Zap className={`${iconClass} text-yellow-600`} />;
      bgColor = 'bg-yellow-100 dark:bg-yellow-900/30';
    } else if (selectedRelayInfo?.limitation?.auth_required) {
      icon = <Shield className={`${iconClass} text-blue-600`} />;
      bgColor = 'bg-blue-100 dark:bg-blue-900/30';
    } else if (selectedRelayInfo?.software) {
      icon = <Server className={`${iconClass} text-orange-600`} />;
      bgColor = 'bg-orange-100 dark:bg-orange-900/30';
    } else if (currentRelay) {
      // Default status indicator
      const isFullAccess = currentRelay.write && currentRelay.read;
      const color = isFullAccess ? 'text-green-500' : currentRelay.read ? 'text-blue-500' : 'text-orange-500';
      icon = <Circle className={`h-2.5 w-2.5 fill-current ${color}`} />;
      bgColor = isFullAccess ? 'bg-green-100 dark:bg-green-900/30' :
                currentRelay.read ? 'bg-blue-100 dark:bg-blue-900/30' :
                'bg-orange-100 dark:bg-orange-900/30';
    } else {
      icon = <Server className={`${iconClass} text-neutral-600`} />;
      bgColor = 'bg-neutral-100 dark:bg-neutral-800';
    }

    return (
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${bgColor}`}>
        {icon}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group"
      >
        {getHeaderRelayIcon()}
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {currentRelayDisplay}
        </h2>
        <ChevronDown className={`h-5 w-5 text-neutral-500 dark:text-neutral-400 transition-transform
                                group-hover:text-neutral-700 dark:group-hover:text-neutral-200
                                ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl
                        border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50">
          <div className="p-2">
            {/* Header */}
            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 mb-2">
              <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Active Relays
              </h3>
            </div>

            {/* All Relays option */}
            <button
              onClick={() => handleRelaySelect(null)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-200
                         hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all mb-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Home (All Relays)</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{enabledRelays.length} relays connected</div>
                </div>
              </div>
              {!selectedRelay && <Check className="h-5 w-5 text-orange-500" />}
            </button>

            {/* Divider */}
            <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-2" />

            {/* Individual relays */}
            <div className="max-h-64 overflow-y-auto">
              {enabledRelays.length > 0 ? (
                enabledRelays.map((relay) => (
                  <RelayItem
                    key={relay.url}
                    relay={relay}
                    isSelected={selectedRelay === relay.url}
                    onSelect={() => handleRelaySelect(relay.url)}
                    getDisplayName={getRelayDisplayName}
                  />
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                  <p>No relays enabled</p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-2" />

            {/* Settings link */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium
                         bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
            >
              Manage Relays →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Relay item component with NIP-11 info
function RelayItem({
  relay,
  isSelected,
  onSelect,
  getDisplayName
}: {
  relay: { url: string; read: boolean; write: boolean; };
  isSelected: boolean;
  onSelect: () => void;
  getDisplayName: (url: string) => string;
}) {
  const { info } = useRelayInfoCached(relay.url);

  // Get relay icon - either from NIP-11 info or use defaults based on features
  const getRelayIcon = () => {
    if (info?.icon) {
      return (
        <img
          src={info.icon}
          alt={info.name || ''}
          className="w-5 h-5 rounded"
          onError={(e) => {
            // Fallback to default icon on error
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    // Use different icons based on relay features
    if (info?.limitation?.payment_required) {
      return <Zap className="h-4 w-4 text-yellow-500" />;
    }
    if (info?.limitation?.auth_required) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    }
    if (info?.software) {
      return <Server className="h-4 w-4 text-orange-500" />;
    }

    // Default status indicator
    return (
      <Circle
        className={`h-3 w-3 ${relay.write && relay.read ? 'fill-green-500 text-green-500' :
                               relay.read ? 'fill-blue-500 text-blue-500' :
                               'fill-orange-500 text-orange-500'}`}
      />
    );
  };

  // Get background color based on relay features
  const getBackgroundColor = () => {
    if (info?.icon) return 'bg-neutral-100 dark:bg-neutral-800';
    if (info?.limitation?.payment_required) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (info?.limitation?.auth_required) return 'bg-blue-100 dark:bg-blue-900/20';
    if (info?.software) return 'bg-orange-100 dark:bg-orange-900/20';

    return relay.write && relay.read ? 'bg-green-100 dark:bg-green-900/20' :
           relay.read ? 'bg-blue-100 dark:bg-blue-900/20' :
           'bg-orange-100 dark:bg-orange-900/20';
  };

  // Get status text - prioritize description over read/write status
  const getStatusText = () => {
    // If we have a description, show it
    if (info?.description) {
      return info.description.length > 60
        ? info.description.substring(0, 60) + '...'
        : info.description;
    }

    // Otherwise fall back to badges and features
    const features = [];

    // Add special feature badges
    if (info?.limitation?.payment_required) features.push('💰 Paid');
    if (info?.limitation?.auth_required) features.push('🔐 Auth');

    // Add software info if no description
    if (info?.software) {
      features.push(info.software);
    }

    // Add permission info only if nothing else is available
    if (features.length === 0) {
      if (relay.write && relay.read) features.push('Read & Write');
      else if (relay.read) features.push('Read only');
      else features.push('Write only');
    }

    return features.slice(0, 2).join(' · ');
  };

  // Get tooltip with full relay info
  const getTooltip = () => {
    const lines = [relay.url];

    if (info?.description) {
      lines.push(`\n${info.description}`);
    }

    if (info?.supported_nips?.length) {
      lines.push(`\nSupports ${info.supported_nips.length} NIPs: ${info.supported_nips.slice(0, 5).join(', ')}${info.supported_nips.length > 5 ? '...' : ''}`);
    }

    if (info?.contact) {
      lines.push(`\nContact: ${info.contact}`);
    }

    return lines.join('');
  };

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200
                 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-all mb-1 group"
      title={getTooltip()}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getBackgroundColor()}`}>
          {getRelayIcon()}
        </div>
        <div className="text-left min-w-0 flex-1">
          <div className="font-medium truncate">
            {info?.name || getDisplayName(relay.url)}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {getStatusText()}
          </div>
        </div>
      </div>
      {isSelected && <Check className="h-5 w-5 text-orange-500 flex-shrink-0 ml-2" />}
    </button>
  );
}