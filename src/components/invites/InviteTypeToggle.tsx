import { InviteType } from '@/features/invites/constants';

interface InviteTypeToggleProps {
  selectedType: InviteType;
  onTypeChange: (type: InviteType) => void;
}

export function InviteTypeToggle({ selectedType, onTypeChange }: InviteTypeToggleProps) {
  return (
    <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-full w-full max-w-sm mx-auto">
      <button
        onClick={() => onTypeChange(InviteType.General)}
        className={`w-1/2 py-2 rounded-full transition-colors font-medium ${selectedType === InviteType.General ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
      >
        🚀 General
      </button>
      <button
        onClick={() => onTypeChange(InviteType.Personalized)}
        className={`w-1/2 py-2 rounded-full transition-colors font-medium ${selectedType === InviteType.Personalized ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
      >
        ✨ Personalized
      </button>
    </div>
  );
}