import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, Trash2, Info, Check, X } from 'lucide-react';

interface Mint {
  id: string;
  url: string;
  name: string;
  balance?: number;
  isActive: boolean;
}

interface MintConfigurationProps {
  variant?: 'minimal' | 'detailed' | 'card';
}

export function MintConfiguration({ variant = 'minimal' }: MintConfigurationProps) {
  const [mints, setMints] = useState<Mint[]>([
    { id: '1', url: 'https://mint.minibits.cash', name: 'Minibits', balance: 10000, isActive: true },
    { id: '2', url: 'https://stablenut.umint.cash', name: 'Stablenut', balance: 5000, isActive: false },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMintUrl, setNewMintUrl] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  const addMint = () => {
    if (newMintUrl) {
      const newMint: Mint = {
        id: Date.now().toString(),
        url: newMintUrl,
        name: new URL(newMintUrl).hostname,
        balance: 0,
        isActive: false
      };
      setMints([...mints, newMint]);
      setNewMintUrl('');
    }
  };

  const removeMint = (id: string) => {
    setMints(mints.filter(m => m.id !== id));
  };

  const toggleMint = (id: string) => {
    setMints(mints.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ));
  };

  if (variant === 'card') {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Cashu Mints</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {mints.map((mint) => (
                <MintItem
                  key={mint.id}
                  mint={mint}
                  onToggle={() => toggleMint(mint.id)}
                  onRemove={() => removeMint(mint.id)}
                />
              ))}
              <AddMintInput
                value={newMintUrl}
                onChange={setNewMintUrl}
                onAdd={addMint}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <div className="text-sm text-gray-600">
            {mints.filter(m => m.isActive).length} active mints
          </div>
        )}
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700">Mints</h3>
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="relative"
            >
              <Info className="w-4 h-4 text-gray-400" />
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-6 top-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap z-10"
                  >
                    Cashu mint (server)
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Close' : 'Configure'}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {mints.map((mint) => (
                <MintItem
                  key={mint.id}
                  mint={mint}
                  onToggle={() => toggleMint(mint.id)}
                  onRemove={() => removeMint(mint.id)}
                  variant="detailed"
                />
              ))}
              <AddMintInput
                value={newMintUrl}
                onChange={setNewMintUrl}
                onAdd={addMint}
                variant="inline"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <div className="flex gap-2 flex-wrap">
            {mints.filter(m => m.isActive).map((mint) => (
              <span
                key={mint.id}
                className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
              >
                {mint.name}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Minimal variant (default)
  return (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <Settings className="w-4 h-4" />
      <span>Mint</span>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-0 top-10 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap z-10"
          >
            Cashu mint (server)
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

interface MintItemProps {
  mint: Mint;
  onToggle: () => void;
  onRemove: () => void;
  variant?: 'compact' | 'detailed';
}

function MintItem({ mint, onToggle, onRemove, variant = 'compact' }: MintItemProps) {
  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              mint.isActive
                ? 'bg-green-500 border-green-500'
                : 'bg-white border-gray-300'
            }`}
          >
            {mint.isActive && <Check className="w-3 h-3 text-white" />}
          </button>
          <div>
            <div className="text-sm font-medium text-gray-900">{mint.name}</div>
            <div className="text-xs text-gray-500">{mint.url}</div>
            {mint.balance && (
              <div className="text-xs text-gray-600 mt-1">
                Balance: {mint.balance.toLocaleString()} sats
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4 text-gray-500" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`w-4 h-4 rounded-full border-2 ${
            mint.isActive
              ? 'bg-green-500 border-green-500'
              : 'bg-white border-gray-300'
          }`}
        />
        <span className="text-sm text-gray-700">{mint.name}</span>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <X className="w-3 h-3 text-gray-500" />
      </button>
    </motion.div>
  );
}

interface AddMintInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  variant?: 'default' | 'inline';
}

function AddMintInput({ value, onChange, onAdd, variant = 'default' }: AddMintInputProps) {
  if (variant === 'inline') {
    return (
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://mint.example.com"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={onAdd}
          disabled={!value}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg">
      <Plus className="w-4 h-4 text-gray-400" />
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        placeholder="Add mint URL"
        className="flex-1 text-sm bg-transparent focus:outline-none"
      />
    </div>
  );
}