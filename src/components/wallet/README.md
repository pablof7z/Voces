# NIP-60 Lightning Wallet UI Components

A gorgeous, elegant, and minimalist wallet UI for NIP-60 Lightning transactions with Cashu mint support.

## Features

- **5 Design Variations**: Choose from minimal light, minimal dark, card elegant, gradient modern, or compact styles
- **Cashu Mint Configuration**: Add and manage multiple Cashu mints with tooltips
- **QR Code Scanner**: Scan Lightning invoices with paste fallback option
- **Send & Receive**: Intuitive transaction modals with mock functionality
- **Subtle Animations**: Smooth Framer Motion animations throughout
- **Responsive Design**: Works beautifully on desktop and mobile

## Components

### Main Components

- `Wallet` - Main wallet component with variant selection
- `WalletBalance` - Displays balance with optional animations
- `MintConfiguration` - Manage Cashu mints configuration
- `TransactionButton` - Send/Receive action buttons
- `QRScanner` - QR code scanning with paste fallback
- `TransactionModal` - Modal for send/receive transactions

### Usage

```tsx
import { Wallet } from '@/components/wallet';

// Basic usage with default minimal-light variant
<Wallet />

// With specific variant
<Wallet variant="gradient-modern" />

// Available variants:
// - 'minimal-light' (default)
// - 'minimal-dark'
// - 'card-elegant'
// - 'gradient-modern'
// - 'compact'
```

## Design Variations

### Minimal Light (Default)
Clean and minimal design with light theme. Features subtle borders and elegant typography.

### Minimal Dark
Sleek dark theme with yellow accents inspired by Lightning. Perfect for dark mode applications.

### Card Elegant
Sophisticated card design with gradient accents and detailed balance display including daily changes.

### Gradient Modern
Bold animated gradient background with glassmorphism effects. Eye-catching and modern.

### Compact
Space-efficient inline design perfect for embedding in sidebars or headers.

## Mock Functionality

All components include mock functionality ready for integration:

- Balance tracking with animated updates
- Mint configuration with add/remove/toggle
- Invoice generation and QR codes
- Clipboard integration for paste functionality
- Transaction processing animations

## Integration with NIP-60

The wallet is designed to integrate with NIP-60 protocol for Cashu ecash wallets:

1. **Mint Management**: Configure and connect to multiple Cashu mints
2. **Balance Aggregation**: Track total balance across all mints
3. **Lightning Integration**: Send/receive via Lightning Network
4. **Zap Support**: Ready for Nostr zap integration

## Customization

Components use Tailwind CSS and can be easily customized:

- Colors can be adjusted via Tailwind classes
- Animations powered by Framer Motion
- Icons from Lucide React
- Fully typed with TypeScript

## Example Integration

See `WalletIntegration.tsx` for a complete example of how to integrate the wallet with zapping functionality.

## Development

To view all wallet variations:
1. Navigate to `/wallet` in your browser
2. Click on different variant buttons to see each design
3. Interact with buttons to see animations and modals

The wallet page showcases all features and variations in an interactive demo.