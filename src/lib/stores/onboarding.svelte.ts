import { ndk } from '$lib/ndk.svelte';
import { NDKEvent, NDKRelaySet, isValidPubkey, type NDKPrivateKeySigner, NDKKind } from '@nostr-dev-kit/ndk';
import { NDKCashuWallet } from '@nostr-dev-kit/wallet';
import { settings } from './settings.svelte';
import { getAgoraLanguage, WALLET_DEFAULT_RELAYS } from '$lib/utils/relayUtils';
import { locale } from 'svelte-i18n';

export interface InviteData {
  welcomeMessage?: string;
  recipientName?: string;
  cashuToken?: string;
  inviter?: string;
  inviteEventId?: string;
  inviteRelay?: string;
  inviteCode?: string;
}

export interface ProfileData {
  name: string;
  bio: string;
  location: string;
  banner?: string;
  picture?: string;
  nip05: string;
}

interface OnboardingState {
  invite: InviteData | null;
  currentStep: number;
  selectedCommunity: string | null;
  selectedPacks: string[];
  profileData: ProfileData;
  hasPublishedInviteConfirmation: boolean;
  hasCompletedInviteSetup: boolean;
}

const DEFAULT_STATE: OnboardingState = {
  invite: null,
  currentStep: 1,
  selectedCommunity: null,
  selectedPacks: [],
  profileData: {
    name: '',
    bio: '',
    location: '',
    banner: undefined,
    picture: undefined,
    nip05: '',
  },
  hasPublishedInviteConfirmation: false,
  hasCompletedInviteSetup: false,
};

function loadState(): OnboardingState {
  if (typeof window === 'undefined') {
    console.log('[Store] Server-side, returning DEFAULT_STATE');
    return DEFAULT_STATE;
  }

  try {
    const stored = sessionStorage.getItem('voces-onboarding');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('[Store] Loaded state from sessionStorage:', parsed);
      return { ...DEFAULT_STATE, ...parsed };
    } else {
      console.log('[Store] No stored state found, using DEFAULT_STATE');
    }
  } catch (e) {
    console.error('[Store] Failed to load onboarding state:', e);
  }

  return DEFAULT_STATE;
}

function saveState(state: OnboardingState) {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem('voces-onboarding', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save onboarding state:', e);
  }
}

class OnboardingStore {
  private state = $state<OnboardingState>(loadState());

  get invite() {
    return this.state.invite;
  }

  get currentStep() {
    return this.state.currentStep;
  }

  get selectedCommunity() {
    return this.state.selectedCommunity;
  }

  get selectedPacks() {
    return this.state.selectedPacks;
  }

  get profileData() {
    return this.state.profileData;
  }

  get hasInvite() {
    return !!this.state.invite;
  }

  get hasCompletedInviteSetup() {
    return this.state.hasCompletedInviteSetup;
  }

  get totalSteps() {
    return this.hasInvite ? 4 : 6;
  }

  get minStep() {
    return this.hasInvite ? 3 : 1;
  }

  setInvite(invite: InviteData) {
    console.log('[Store] setInvite called with:', invite);
    this.state.invite = invite;

    // Pre-fill profile name if available
    if (invite.recipientName && !this.state.profileData.name) {
      console.log('[Store] Pre-filling profile name:', invite.recipientName);
      this.state.profileData.name = invite.recipientName;
    }

    // Set language based on agora relay
    if (invite.inviteRelay) {
      const agoraLanguage = getAgoraLanguage(invite.inviteRelay);
      if (agoraLanguage) {
        console.log(`[Store] Setting language to ${agoraLanguage} based on agora relay ${invite.inviteRelay}`);
        settings.setLanguage(agoraLanguage);
        locale.set(agoraLanguage);
      }
    }

    // Skip to step 3 (features) when using invite
    console.log('[Store] Setting step to 3 (features)');
    this.state.currentStep = 3;

    saveState(this.state);
    console.log('[Store] ✓ Invite data saved to sessionStorage');
  }

  setStep(step: number) {
    this.state.currentStep = step;
    saveState(this.state);
  }

  setSelectedCommunity(community: string | null) {
    this.state.selectedCommunity = community;
    saveState(this.state);
  }

  setSelectedPacks(packs: string[]) {
    this.state.selectedPacks = packs;
    saveState(this.state);
  }

  setProfileData(data: Partial<ProfileData>) {
    this.state.profileData = { ...this.state.profileData, ...data };
    saveState(this.state);
  }

  async publishInviteConfirmation(signer: NDKPrivateKeySigner) {
    console.log('[Store] publishInviteConfirmation called:', {
      hasPublished: this.state.hasPublishedInviteConfirmation,
      inviteData: this.state.invite
    });

    if (this.state.hasPublishedInviteConfirmation) {
      console.log('[Store] ⊘ Invite confirmation already published');
      return;
    }

    const invite = this.state.invite;
    console.log('[Store] Checking invite data:', {
      hasInvite: !!invite,
      inviteEventId: invite?.inviteEventId,
      inviter: invite?.inviter,
      inviteRelay: invite?.inviteRelay,
      inviteCode: invite?.inviteCode
    });

    if (!invite?.inviteEventId || !invite?.inviter || !invite?.inviteRelay || !invite?.inviteCode) {
      console.warn('[Store] ✗ Missing required invite data for confirmation');
      return;
    }

    try {
      console.log('[Store] Creating kind:514 event...');
      const confirmationEvent = new NDKEvent(ndk);
      confirmationEvent.kind = 514;
      confirmationEvent.content = '';
      confirmationEvent.tags = [
        ['e', invite.inviteEventId],
        ['p', invite.inviter],
        ['code', invite.inviteCode],
      ];
      confirmationEvent.isProtected = true;

      console.log('[Store] Signing event...');
      await confirmationEvent.sign();
      console.log('[Store] ✓ Event signed');

      // Publish ONLY to the invite relay
      console.log('[Store] Getting relay:', invite.inviteRelay);
      const relay = ndk.pool.getRelay(invite.inviteRelay, true);
      if (relay) {
        console.log('[Store] ✓ Relay obtained:', relay.url);
        const relaySet = new NDKRelaySet(new Set([relay]), ndk);
        console.log('[Store] Publishing kind:514 invite confirmation to', invite.inviteRelay);
        await confirmationEvent.publish(relaySet);
        console.log('[Store] ✓ Successfully published kind:514 invite confirmation');

        // Set the invite relay as the selected relay in settings
        console.log('[Store] Setting selected relay in settings...');
        settings.setSelectedRelay(invite.inviteRelay);

        // Also ensure the relay is in the user's relay list
        const existingRelay = settings.relays.find(r => r.url === invite.inviteRelay);
        if (!existingRelay) {
          console.log('[Store] Adding relay to settings...');
          settings.addRelay({
            url: invite.inviteRelay,
            read: true,
            write: true,
            enabled: true
          });
        } else {
          console.log('[Store] Relay already in settings');
        }

        // Mark as published
        this.state.hasPublishedInviteConfirmation = true;
        saveState(this.state);
        console.log('[Store] ✓ Marked as published in state');
      } else {
        console.error('[Store] ✗ Failed to get relay:', invite.inviteRelay);
      }
    } catch (err) {
      console.error('[Store] ✗ Error publishing invite confirmation:', err);
      throw err;
    }
  }

  async copyInviterContacts(signer: NDKPrivateKeySigner) {
    console.log('[Store] copyInviterContacts called');
    const invite = this.state.invite;

    if (!invite?.inviter) {
      console.warn('[Store] ✗ No inviter to copy contacts from');
      return;
    }

    try {
      console.log('[Store] Fetching inviter contacts for:', invite.inviter);
      const inviterContactEvent = await ndk.fetchEvent({
        kinds: [3],
        authors: [invite.inviter]
      });

      if (inviterContactEvent) {
        console.log('[Store] ✓ Found inviter contact list');
        const pTags = new Set(
          inviterContactEvent.tags
            .filter(tag => tag[0] === 'p')
            .map(tag => tag[1])
            .filter(isValidPubkey)
        );
        pTags.add(invite.inviter); // Also follow the inviter
        pTags.add(signer.pubkey); // Add self to contact list

        console.log(`[Store] Found ${pTags.size} contacts from inviter (including inviter + self)`);

        // Create our contact list with the inviter's contacts
        const contactListEvent = new NDKEvent(ndk);
        contactListEvent.kind = 3;
        contactListEvent.content = '';
        contactListEvent.tags = Array.from(pTags).map(pubkey => ['p', pubkey]);

        console.log('[Store] Publishing kind:3 contact list...');
        await contactListEvent.publish();
        console.log('[Store] ✓ Published kind:3 contact list with inviter\'s follows');
      } else {
        console.log('[Store] ⊘ No contact list found for inviter');
      }
    } catch (err) {
      console.error('[Store] ✗ Error copying inviter contacts:', err);
    }
  }

  async publishProfile() {
    console.log('[Store] publishProfile called');
    const profile = this.state.profileData;
    const invite = this.state.invite;

    if (!profile.name) {
      console.warn('[Store] ✗ No profile name, skipping profile publish');
      return;
    }

    try {
      console.log('[Store] Creating kind:0 profile event...');
      const profileEvent = new NDKEvent(ndk);
      profileEvent.kind = 0;
      profileEvent.content = JSON.stringify({
        name: profile.name,
        about: profile.bio,
        ...(profile.location && { location: profile.location }),
        ...(profile.picture && { picture: profile.picture }),
        ...(profile.nip05 && { nip05: profile.nip05 })
      });

      // Publish to default relays
      await profileEvent.publish();

      // If we have an invite relay, publish there first
      if (invite?.inviteRelay) {
        console.log('[Store] Publishing kind:0 to invite relay:', invite.inviteRelay);
        const relay = ndk.pool.getRelay(invite.inviteRelay, true);
        if (relay) {
          const relaySet = NDKRelaySet.fromRelayUrls([invite.inviteRelay], ndk);
          await profileEvent.publish(relaySet);
          console.log('[Store] ✓ Published kind:0 to invite relay');
        }
      }
    } catch (err) {
      console.error('[Store] ✗ Error publishing profile:', err);
      throw err;
    }
  }

  async publishRelayList() {
    console.log('[Store] publishRelayList called');
    const invite = this.state.invite;

    try {
      // Build relay list: agora relay (if present), purplepag.es, relay.primal.net
      const relays = new Set<string>();

      // Add agora relay from invite if present
      if (invite?.inviteRelay) {
        relays.add(invite.inviteRelay);
        console.log('[Store] Including agora relay from invite:', invite.inviteRelay);
      }

      // Add default relays
      relays.add('wss://purplepag.es');
      relays.add('wss://relay.primal.net');

      console.log('[Store] Building kind:10002 relay list with relays:', Array.from(relays));

      // Create kind:10002 relay list event
      const relayListEvent = new NDKEvent(ndk);
      relayListEvent.kind = 10002;
      relayListEvent.content = '';
      relayListEvent.tags = Array.from(relays).map(url => ['r', url]);

      console.log('[Store] Publishing kind:10002 relay list...');
      await relayListEvent.publish();
      console.log('[Store] ✓ Published kind:10002 relay list');
    } catch (err) {
      console.error('[Store] ✗ Error publishing relay list:', err);
      throw err;
    }
  }

  async createWalletFromInviter() {
    console.log('[Store] createWalletFromInviter called');
    const invite = this.state.invite;

    if (!invite?.inviter) {
      console.warn('[Store] ✗ No inviter to copy wallet from');
      return;
    }

    try {
      console.log('[Store] Fetching inviter wallet for:', invite.inviter);

      // Fetch the inviter's wallet event (kind 17375)
      const inviterWalletEvent = await ndk.fetchEvent({
        kinds: [NDKKind.CashuWallet],
        authors: [invite.inviter]
      });

      if (!inviterWalletEvent) {
        console.log('[Store] ⊘ No wallet found for inviter, creating default wallet');
        // Create wallet with default mint
        await this.createDefaultWallet();
        return;
      }

      console.log('[Store] ✓ Found inviter wallet event');

      // Parse the inviter's wallet to extract configuration
      const inviterWallet = await NDKCashuWallet.from(inviterWalletEvent);

      if (!inviterWallet) {
        console.log('[Store] ✗ Could not parse inviter wallet, creating default wallet');
        await this.createDefaultWallet();
        return;
      }

      // Extract mints and relays from inviter's wallet
      const mints = inviterWallet.mints;
      const relays = inviterWallet.relaySet?.relayUrls
        ? Array.from(inviterWallet.relaySet.relayUrls)
        : [...WALLET_DEFAULT_RELAYS];

      console.log('[Store] Copying wallet config from inviter:', {
        mints,
        relays
      });

      // Create new wallet with inviter's configuration
      const newWallet = await NDKCashuWallet.create(
        ndk,
        mints,
        relays
      );

      console.log('[Store] ✓ Created and published wallet with inviter\'s configuration');

    } catch (err) {
      console.error('[Store] ✗ Error creating wallet from inviter:', err);
      // Fallback to default wallet
      await this.createDefaultWallet();
    }
  }

  async createDefaultWallet() {
    console.log('[Store] Creating wallet with default configuration');
    try {
      const defaultMints = ['https://mint.minibits.cash/Bitcoin'];
      const defaultRelays = [...WALLET_DEFAULT_RELAYS];
      const wallet = await NDKCashuWallet.create(ndk, defaultMints, defaultRelays);
      console.log('[Store] ✓ Created wallet with default mints:', defaultMints, 'and relays:', defaultRelays);
    } catch (err) {
      console.error('[Store] ✗ Error creating default wallet:', err);
    }
  }

  async completeInviteSetup(signer: NDKPrivateKeySigner) {
    console.log('[Store] completeInviteSetup called:', {
      hasCompletedSetup: this.state.hasCompletedInviteSetup,
      hasInvite: this.hasInvite
    });

    if (this.state.hasCompletedInviteSetup) {
      console.log('[Store] ⊘ Invite setup already completed, skipping');
      return;
    }

    if (!this.hasInvite) {
      console.log('[Store] ⊘ No invite data, skipping invite setup');
      return;
    }

    try {
      console.log('[Store] Starting invite setup sequence...');

      await this.publishInviteConfirmation(signer);
      await this.copyInviterContacts(signer);
      await this.publishRelayList();
      await this.createWalletFromInviter();

      this.state.hasCompletedInviteSetup = true;
      saveState(this.state);
      console.log('[Store] ✓ Invite setup complete');
    } catch (err) {
      console.error('[Store] ✗ Error during invite setup:', err);
      throw err;
    }
  }

  clear() {
    this.state = { ...DEFAULT_STATE };
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('voces-onboarding');
    }
  }
}

export const onboardingStore = new OnboardingStore();
