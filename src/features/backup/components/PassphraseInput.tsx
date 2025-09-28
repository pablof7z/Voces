import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { validatePassphraseStrength } from '../utils/passphrase';
import { SecurePasswordField } from './SecurePasswordField';
import { WarningBanner } from './WarningBanner';

interface PassphraseInputProps {
  value: string;
  confirmValue: string;
  onChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onValidChange: (isValid: boolean) => void;
}

export function PassphraseInput({
  value,
  confirmValue,
  onChange,
  onConfirmChange,
  onValidChange
}: PassphraseInputProps) {
  const { t } = useTranslation();
  const [touched, setTouched] = useState({ passphrase: false, confirm: false });

  const validation = validatePassphraseStrength(value);
  const passphraseMatch = value === confirmValue && value.length > 0;

  useEffect(() => {
    onValidChange(validation.valid && passphraseMatch);
  }, [validation.valid, passphraseMatch, onValidChange]);

  return (
    <div className="space-y-4">
      <WarningBanner
        title={t('backup.passphrase.warning.title')}
        description={t('backup.passphrase.warning.description')}
        variant="warning"
      />

      <SecurePasswordField
        label={t('backup.passphrase.label')}
        value={value}
        placeholder={t('backup.passphrase.placeholder')}
        onChange={onChange}
        onBlur={() => setTouched({ ...touched, passphrase: true })}
        isValid={validation.valid}
        touched={touched.passphrase}
        errors={validation.errors}
        successMessage={t('backup.passphrase.strong')}
      />

      <SecurePasswordField
        label={t('backup.passphrase.confirmLabel')}
        value={confirmValue}
        placeholder={t('backup.passphrase.confirmPlaceholder')}
        onChange={onConfirmChange}
        onBlur={() => setTouched({ ...touched, confirm: true })}
        isValid={passphraseMatch}
        touched={touched.confirm}
        errors={passphraseMatch ? [] : [t('backup.passphrase.mismatch')]}
        successMessage={t('backup.passphrase.match')}
      />
    </div>
  );
}