import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SecurePasswordFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isValid?: boolean;
  touched?: boolean;
  errors?: string[];
  successMessage?: string;
}

export function SecurePasswordField({
  label,
  value,
  placeholder,
  onChange,
  onBlur,
  isValid = true,
  touched = false,
  errors = [],
  successMessage
}: SecurePasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const hasErrors = touched && errors.length > 0;
  const showSuccess = touched && isValid && value.length > 0 && successMessage;

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
        {label}
      </label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={cn(
            'pr-10',
            hasErrors && 'border-red-500 focus:ring-red-500'
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {hasErrors && (
        <div className="mt-2 space-y-1">
          {errors.map((error, idx) => (
            <p key={idx} className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          ))}
        </div>
      )}

      {showSuccess && (
        <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {successMessage}
        </p>
      )}
    </div>
  );
}