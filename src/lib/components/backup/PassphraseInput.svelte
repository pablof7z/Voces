<script lang="ts">
  import { validatePassphraseStrength } from '$lib/backup/utils/passphrase';
  import SecurePasswordField from './SecurePasswordField.svelte';
  import WarningBanner from './WarningBanner.svelte';

  interface Props {
    value: string;
    confirmValue: string;
    onChange: (value: string) => void;
    onConfirmChange: (value: string) => void;
    onValidChange: (isValid: boolean) => void;
  }

  let { value, confirmValue, onChange, onConfirmChange, onValidChange }: Props = $props();

  let touched = $state({ passphrase: false, confirm: false });

  let validation = $derived(validatePassphraseStrength(value));
  let passphraseMatch = $derived(value === confirmValue && value.length > 0);

  $effect(() => {
    onValidChange(validation.valid && passphraseMatch);
  });
</script>

<div class="space-y-4">
  <WarningBanner
    title="Passphrase Warning"
    description="Your passphrase encrypts your key shards. If you forget it, your backup cannot be recovered. Write it down and store it securely."
    variant="warning"
  />

  <SecurePasswordField
    label="Passphrase"
    {value}
    placeholder="Enter a strong passphrase"
    onChange={(v) => onChange(v)}
    onBlur={() => touched = { ...touched, passphrase: true }}
    isValid={validation.valid}
    touched={touched.passphrase}
    errors={validation.errors}
    successMessage="Strong passphrase"
  />

  <SecurePasswordField
    label="Confirm Passphrase"
    value={confirmValue}
    placeholder="Confirm your passphrase"
    onChange={(v) => onConfirmChange(v)}
    onBlur={() => touched = { ...touched, confirm: true }}
    isValid={passphraseMatch}
    touched={touched.confirm}
    errors={passphraseMatch ? [] : ['Passphrases do not match']}
    successMessage="Passphrases match"
  />
</div>
