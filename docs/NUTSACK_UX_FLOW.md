# Nutsack Wallet UX Flow Diagrams

## Minting Flow (Lightning Deposit)

```
┌─────────────────────────────────────────────────────────────────┐
│                         MintView                                 │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Amount Input Section                          │  │
│  │                                                             │  │
│  │            ┌─────────────────────┐                         │  │
│  │            │   1,000  sats       │  (Large, 48pt font)     │  │
│  │            │   ≈ $0.00 USD       │  (Placeholder)          │  │
│  │            └─────────────────────┘                         │  │
│  │                                                             │  │
│  │   [ 1k ]  [ 5k ]  [ 10k ]  [ 21k ]  [ 100k ]              │  │
│  │   (Quick preset buttons)                                   │  │
│  │                                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Mint Selection Section                        │  │
│  │                                                             │  │
│  │  Select Mint                                               │  │
│  │                                                             │  │
│  │  ┌───────────────────────────────────────────────────┐    │  │
│  │  │  🏛️  mint.example.com                         ✓  │    │  │
│  │  │      mint.example.com                              │    │  │
│  │  └───────────────────────────────────────────────────┘    │  │
│  │                                                             │  │
│  │  ┌───────────────────────────────────────────────────┐    │  │
│  │  │  🏛️  another-mint.com                             │    │  │
│  │  │      another-mint.com                              │    │  │
│  │  └───────────────────────────────────────────────────┘    │  │
│  │                                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │              [ Create Invoice ]                            │  │
│  │              (Fixed bottom button)                         │  │
│  │                                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Tap "Create Invoice"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       InvoiceView                                │
│                         (Sheet)                                  │
│                                                                   │
│                        1000                                      │
│                        sats                                      │
│                                                                   │
│                    ┌───────────┐                                │
│                    │           │                                 │
│                    │  QR CODE  │                                 │
│                    │           │                                 │
│                    └───────────┘                                │
│                                                                   │
│  lnbc1000n1p...truncated...xyz                                  │
│  (Monospaced, 3 lines max)                                      │
│                                                                   │
│              [ 📋 Copy Invoice ]                                │
│                                                                   │
│          [ 🔄 Check Payment Status ]                            │
│                                                                   │
│                    ⏳ Waiting for payment...                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Payment detected
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PaymentReceivedAnimation                            │
│                  (Full Screen)                                   │
│                                                                   │
│                      ╭────╮                                      │
│                     │  ✓  │  (Animated checkmark)               │
│                      ╰────╯                                      │
│                                                                   │
│                    1000  sats                                    │
│                                                                   │
│                 Payment Received                                 │
│                                                                   │
│  (Radial orange glow animation)                                 │
│  (Auto-dismiss after 2.5s)                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Receiving Flow (Ecash Token Redemption)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ReceiveView                               │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Ecash Token                                               │  │
│  │  ─────────────────────────────────────────────────────────│  │
│  │                                                             │  │
│  │  ┌────────────────────────────────────┐  ┌──────────┐    │  │
│  │  │ Paste ecash token                  │  │    QR    │    │  │
│  │  │                                     │  │  Scanner │    │  │
│  │  │ (Multi-line, monospaced)           │  │          │    │  │
│  │  └────────────────────────────────────┘  └──────────┘    │  │
│  │                                                             │  │
│  │  💵 Ecash token detected                                   │  │
│  │  (Shows when token present)                                │  │
│  │                                                             │  │
│  │  Paste or scan an ecash token to redeem it                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │              [ Redeem Token ]                              │  │
│  │                                                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Tap "Redeem Token"
                              ▼
                      [Processing...]
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PaymentReceivedAnimation                            │
│                  (Full Screen)                                   │
│                                                                   │
│                      ╭────╮                                      │
│                     │  ✓  │  (Animated checkmark)               │
│                      ╰────╯                                      │
│                                                                   │
│                    500  sats                                     │
│                                                                   │
│                   Received!                                      │
│                                                                   │
│                                                                   │
│                     [ Done ]                                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## QR Scanner Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        QRScannerView                             │
│                         (Sheet)                                  │
│                                                                   │
│                                                                   │
│          ┌─────────────────────────────────┐                    │
│          │                                  │                    │
│          │                                  │                    │
│          │       📷 Camera View             │                    │
│          │                                  │                    │
│          │          ┌──────┐               │                    │
│          │          │  QR  │               │                    │
│          │          │ Code │               │                    │
│          │          └──────┘               │                    │
│          │                                  │                    │
│          └─────────────────────────────────┘                    │
│                                                                   │
│                 Point camera at QR code                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ QR code detected
                              ▼
                  Token auto-filled in ReceiveView
```

## Animation Sequence (PaymentReceivedAnimation)

```
Timeline:
─────────────────────────────────────────────────────────────────

t=0s     Dark backdrop fades in
         │
         ▼
t=0.0s   ┌─────────┐
         │ Glow    │ Backdrop glow animation (0.4s)
t=0.4s   └─────────┘
         │
         ▼
t=0.0s   ┌─────────┐
         │ Ring    │ Ring appears and scales (0.6s)
t=0.6s   └─────────┘
         │
         ▼
t=0.3s   ┌─────────┐
         │   ✓     │ Checkmark springs in (0.3s)
t=0.6s   └─────────┘ 📳 Medium haptic feedback
         │
         ▼
t=0.5s   ┌─────────┐
         │ Amount  │ Amount fades in (0.4s)
t=0.9s   └─────────┘
         │
         ▼
t=0.7s   ┌─────────┐
         │ Success │ Text appears (0.3s)
t=1.0s   └─────────┘ 📳 Success haptic
         │
         ▼
t=2.5s   Auto-dismiss starts (0.3s fade out)
         │
         ▼
t=2.8s   View dismissed
```

## State Machine: Minting Flow

```
┌─────────────┐
│   Initial   │
│   State     │
└──────┬──────┘
       │
       │ User inputs amount & selects mint
       ▼
┌─────────────┐
│   Ready     │ (isValidAmount = true)
│   to Mint   │
└──────┬──────┘
       │
       │ Tap "Create Invoice"
       ▼
┌─────────────┐
│  Creating   │ (isMinting = true)
│  Invoice    │
└──────┬──────┘
       │
       │ walletManager.requestMint()
       ▼
┌─────────────────┐
│  Showing        │
│  Invoice +      │ (showInvoice = true)
│  Monitoring     │ (depositTask running)
└────────┬────────┘
         │
         ├────── Payment Detected ──────┐
         │                              │
         │                              ▼
         │                     ┌─────────────┐
         │                     │  Success    │
         │                     │  Animation  │
         │                     └──────┬──────┘
         │                            │
         │                            ▼
         │                     ┌─────────────┐
         │                     │  Dismissed  │
         │                     └─────────────┘
         │
         ├────── Invoice Expired ───────┐
         │                              │
         │                              ▼
         │                     ┌─────────────┐
         │                     │    Error    │
         │                     │    Alert    │
         │                     └─────────────┘
         │
         └────── Network Error ─────────┐
                                        │
                                        ▼
                                ┌─────────────┐
                                │    Error    │
                                │    Alert    │
                                └─────────────┘
```

## State Machine: Receiving Flow

```
┌─────────────┐
│   Initial   │
│   State     │
└──────┬──────┘
       │
       │ User pastes/scans token
       ▼
┌─────────────┐
│   Token     │ (!inputToken.isEmpty)
│   Detected  │
└──────┬──────┘
       │
       │ Tap "Redeem Token"
       ▼
┌─────────────┐
│ Processing  │ (isProcessing = true)
│ Redemption  │
└──────┬──────┘
       │
       │ walletManager.receive()
       │
       ├────── Success ──────┐
       │                     │
       │                     ▼
       │            ┌─────────────┐
       │            │  Success    │
       │            │  Animation  │
       │            └──────┬──────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │  Dismissed  │
       │            └─────────────┘
       │
       └────── Error ──────┐
                           │
                           ▼
                   ┌─────────────┐
                   │    Error    │
                   │    Alert    │
                   └─────────────┘
```

## User Interaction Patterns

### Touch Targets

```
Large Touch Targets (44x44 or larger):
┌────────────────────────────────────┐
│  QR Scanner Button (44x44)         │
│  ┌──────────┐                      │
│  │    QR    │                      │
│  │  Scanner │                      │
│  └──────────┘                      │
│                                     │
│  Amount Display (tap anywhere)     │
│  ┌──────────────────────────────┐ │
│  │        1,000 sats             │ │
│  └──────────────────────────────┘ │
│                                     │
│  Mint Selection Rows (full width) │
│  ┌──────────────────────────────┐ │
│  │  🏛️  mint.example.com  ✓    │ │
│  └──────────────────────────────┘ │
│                                     │
│  Bottom Action Button (full width)│
│  ┌──────────────────────────────┐ │
│  │    [ Create Invoice ]        │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

### Visual Feedback States

```
Button States:
───────────────

Normal:
┌──────────────────────┐
│  [ Create Invoice ]  │  White text on orange
└──────────────────────┘

Processing:
┌──────────────────────┐
│  ⏳ Creating...      │  Orange text on light orange
└──────────────────────┘

Disabled:
┌──────────────────────┐
│  [ Create Invoice ]  │  Grayed out
└──────────────────────┘

Success (Copy):
┌──────────────────────┐
│  ✓ Copied!           │  White text on green
└──────────────────────┘
```

### Typography Hierarchy

```
Primary Amount: 48pt, semibold, rounded
│
├─ Secondary Unit: 20pt, medium, rounded (sats)
│
├─ Tertiary Info: 16pt, regular, rounded (USD equivalent)
│
├─ Headings: 16pt, medium (Section titles)
│
├─ Body Text: System default (Descriptions)
│
└─ Caption: 12pt (Mint URLs, Helper text)
```

### Color Scheme

```
Primary Actions:     Orange (#FF9500)
Success:             Green
Error:               Red
Background:          System Background (.systemBackground)
Secondary Text:      System Secondary (.secondary)

Accents:
- Orange 15% opacity: Button backgrounds
- Orange 30% opacity: Processing state
- Black 85% opacity:  Success animation backdrop
```

## Key UX Principles Applied

1. **Progressive Disclosure**: Show only what's needed at each step
2. **Immediate Feedback**: Visual and haptic feedback for all actions
3. **Clear Visual Hierarchy**: Important info (amounts) is largest
4. **Consistent Patterns**: Similar flows use similar animations
5. **Error Recovery**: Clear error messages with options to retry
6. **Accessibility**: Large touch targets, clear states, keyboard optimization
7. **Smart Defaults**: Auto-select options when possible
8. **Non-blocking**: Background monitoring doesn't block UI
9. **Celebration**: Success animations make receiving feel rewarding
10. **Escape Routes**: Cancel buttons and tap-to-dismiss options
