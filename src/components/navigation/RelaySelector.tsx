import { ChevronDown, Globe, Circle, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useNavigate } from "react-router-dom";

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

  const currentRelayDisplay = selectedRelay
    ? getRelayDisplayName(selectedRelay)
    : `All Relays (${enabledRelays.length})`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-600 dark:text-gray-400
                   hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="max-w-[140px] truncate font-normal">{currentRelayDisplay}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg
                        border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="py-1">
            {/* All Relays option */}
            <button
              onClick={() => handleRelaySelect(null)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>All Relays ({enabledRelays.length})</span>
              </div>
              {!selectedRelay && <Check className="h-4 w-4 text-green-500" />}
            </button>

            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

            {/* Individual relays */}
            {enabledRelays.length > 0 ? (
              enabledRelays.map((relay) => (
                <button
                  key={relay.url}
                  onClick={() => handleRelaySelect(relay.url)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200
                             hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Circle
                      className={`h-2 w-2 ${relay.write && relay.read ? 'fill-green-500 text-green-500' :
                                             relay.read ? 'fill-blue-500 text-blue-500' :
                                             'fill-orange-500 text-orange-500'}`}
                    />
                    <span className="truncate">{getRelayDisplayName(relay.url)}</span>
                  </div>
                  {selectedRelay === relay.url && <Check className="h-4 w-4 text-green-500" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No relays enabled
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

            {/* Settings link */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Manage Relays →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}