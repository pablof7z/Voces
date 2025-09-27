#!/usr/bin/env tsx
/**
 * Test script for NIP-60 wallet and NIP-61 nutzaps
 * Refactored to use smaller, single-purpose helper functions
 */

import {
  initializeNDKConnection,
  generateWalletKeypair,
  createCashuWallet,
  createWalletDeposit,
  setupNutzapMonitoring,
  sendNutzapToRecipient,
  cleanupWalletResources,
  type WalletSetupResult,
} from './wallet-helpers';

const TESTNUT_MINT_URL = "https://nofees.testnut.cashu.space";
const DEFAULT_RELAY_URLS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
];

const TEST_DEPOSIT_AMOUNT = 100;
const MONITORING_DURATION_MS = 30000;

async function performWalletSetup(): Promise<WalletSetupResult> {
  console.log("🔧 Setting up NDK connection...");
  const ndk = await initializeNDKConnection({
    explicitRelayUrls: DEFAULT_RELAY_URLS,
  });
  console.log("✅ Connected to relays");

  console.log("\n👤 Generating keypair...");
  const { signer, user } = await generateWalletKeypair();
  console.log("👤 User pubkey:", user.pubkey);
  console.log("🔐 Private key:", signer.privateKey);

  console.log("\n💰 Creating NIP-60 wallet...");
  const wallet = await createCashuWallet(ndk, signer, [TESTNUT_MINT_URL]);
  console.log("✅ Wallet created and started");
  console.log("💵 Initial balance:", wallet.balance?.amount || 0, "sats");

  console.log("\n👀 Setting up nutzap monitor...");
  const monitor = await setupNutzapMonitoring(ndk, wallet, user);
  console.log("✅ Nutzap monitor started");

  return { ndk, signer, user, wallet, monitor };
}

async function handleDepositCreation(walletSetup: WalletSetupResult): Promise<void> {
  console.log(`\n📥 Creating deposit for ${TEST_DEPOSIT_AMOUNT} sats...`);
  
  try {
    const depositResult = await createWalletDeposit(
      walletSetup.wallet,
      TEST_DEPOSIT_AMOUNT,
      TESTNUT_MINT_URL
    );
    
    console.log("✅ Deposit successful!");
    console.log("🎫 Token received");
    console.log("\n💵 Balance after deposit:", walletSetup.wallet.balance?.amount || 0, "sats");
  } catch (error) {
    console.error("❌ Deposit failed:", error);
    throw error;
  }
}

async function handleNutzapSending(
  walletSetup: WalletSetupResult,
  recipientPubkey: string,
  amountSats: number
): Promise<void> {
  console.log(`\n⚡ Sending ${amountSats} sat nutzap...`);
  
  const sendResult = await sendNutzapToRecipient(
    walletSetup.ndk,
    walletSetup.wallet,
    recipientPubkey,
    amountSats
  );

  if (sendResult.success) {
    console.log(`✅ Nutzap sent successfully! ID: ${sendResult.nutzapId?.substring(0, 8)}`);
  } else {
    console.error(`❌ Failed to send nutzap:`, sendResult.error?.message);
  }
}

async function monitorForIncomingNutzaps(durationMs: number): Promise<void> {
  console.log(`\n⏳ Monitoring for incoming nutzaps for ${durationMs / 1000} seconds...`);
  await new Promise((resolve) => setTimeout(resolve, durationMs));
}

function displayWalletSummary(walletSetup: WalletSetupResult): void {
  console.log("\n✅ Wallet setup complete!");
  console.log("\nWallet Info:");
  console.log("- Pubkey:", walletSetup.user.pubkey);
  console.log("- P2PK:", walletSetup.wallet.p2pk);
  console.log("- Mint:", TESTNUT_MINT_URL);
  console.log("- Balance:", walletSetup.wallet.balance?.amount || 0, "sats");
  
  console.log("\n💡 To send a nutzap, run:");
  console.log("   tsx scripts/test-wallet.ts send <recipient-pubkey> <amount>");
}

async function main() {
  console.log("🚀 NIP-60/61 Wallet Test Script\n");
  console.log("This script will:");
  console.log("1. Generate a new keypair");
  console.log("2. Create a NIP-60 wallet");
  console.log("3. Configure the testnut mint");
  console.log("4. Create a test deposit");
  console.log("5. Setup nutzap monitoring");
  console.log("6. Optionally send a test nutzap\n");

  let walletSetup: WalletSetupResult | null = null;

  try {
    walletSetup = await performWalletSetup();
    await handleDepositCreation(walletSetup);
    displayWalletSummary(walletSetup);

    const commandArgs = process.argv.slice(2);
    if (commandArgs[0] === "send" && commandArgs[1] && commandArgs[2]) {
      const recipientPubkey = commandArgs[1];
      const amountSats = parseInt(commandArgs[2]);

      if (isNaN(amountSats) || amountSats <= 0) {
        throw new Error("Invalid amount specified");
      }

      await handleNutzapSending(walletSetup, recipientPubkey, amountSats);
    }

    await monitorForIncomingNutzaps(MONITORING_DURATION_MS);

    console.log("\n✅ Test complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    if (walletSetup) {
      cleanupWalletResources(walletSetup.wallet, walletSetup.monitor);
    }
  }
}

main();