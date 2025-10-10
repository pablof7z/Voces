# Nutsack Wallet Receive/Deposit Implementation Research

## Overview

The Nutsack wallet (iOS implementation) has two distinct flows for receiving funds:

1. **Minting (Deposit via Lightning)** - User deposits Bitcoin via Lightning invoice to receive ecash tokens
2. **Receiving (Redeeming ecash tokens)** - User redeems existing Cashu ecash tokens

## 1. Minting Flow (MintView.swift)

### Purpose
Allows users to deposit Bitcoin via a Lightning invoice, which a Cashu mint then converts into ecash tokens stored in their wallet.

### UI Components Structure

The view is structured as:
```
VStack
├── ScrollView
│   ├── amountInputSection
│   └── mintSelectionSection
└── createInvoiceButton (fixed at bottom)
```

### Key UI Components

#### A. Amount Input Section (`amountInputSection`)

**Visual Display:**
- Large formatted amount display (e.g., "1,000 sats") with thousand separators
- USD equivalent placeholder ("≈ $0.00 USD")
- Hidden `TextField` with `keyboardType(.numberPad)` and `opacity(0)` for custom input experience
- The visual display (HStack with Text) is tapped to focus the hidden field

```swift
VStack(spacing: 16) {
    // Hidden text field that drives the amount
    TextField("0", text: $amount)
        .keyboardType(.numberPad)
        .opacity(0)
        .frame(height: 0)
        .focused($amountFieldFocused)

    // Visual amount display
    VStack(spacing: 8) {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            Text(formattedAmount)
                .font(.system(size: 48, weight: .semibold, design: .rounded))
                .foregroundStyle(.primary)
            Text("sats")
                .font(.system(size: 20, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)
        }
        .contentShape(Rectangle())
        .onTapGesture {
            amountFieldFocused = true
        }

        Text("≈ $0.00 USD")
            .font(.system(size: 16, weight: .regular, design: .rounded))
            .foregroundStyle(.secondary)
            .opacity(0.6)
    }

    // Quick amount buttons
    HStack(spacing: 12) {
        ForEach(AmountPresets.nutzapAmounts, id: \.self) { preset in
            Button(action: { setAmount(preset) }) {
                Text("\(preset / 1000)k")
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundColor(.orange)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(Color.orange.opacity(0.15))
                    .cornerRadius(16)
            }
        }
    }
}
```

**Quick Amount Buttons:**
- Horizontal HStack with preset amounts (e.g., "1k", "5k")
- Tapping sets the `$amount` state variable

#### B. Mint Selection Section (`mintSelectionSection`)

```swift
VStack(alignment: .leading, spacing: 12) {
    Text("Select Mint")
        .font(.headline)
        .padding(.horizontal)

    if availableMints.isEmpty {
        HStack {
            ProgressView()
                .scaleEffect(0.8)
            Text("Loading mints...")
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 8)
    } else {
        VStack(spacing: 8) {
            ForEach(availableMints, id: \.url.absoluteString) { mint in
                mintRow(for: mint)
            }
        }
    }
}
```

**Mint Row:**
- Circle icon with building.columns symbol
- Mint name (host) and full URL
- Checkmark indicator for selected mint
- Tap to select

```swift
HStack {
    Circle()
        .fill(Color.orange.opacity(0.15))
        .frame(width: 40, height: 40)
        .overlay(
            Image(systemName: "building.columns")
                .font(.system(size: 16))
                .foregroundColor(.orange)
        )
    VStack(alignment: .leading, spacing: 2) {
        Text(mint.name ?? mint.url.host ?? "Unknown Mint")
            .font(.system(size: 16, weight: .medium))
        Text(mint.url.host ?? mint.url.absoluteString)
            .font(.system(size: 12))
            .foregroundStyle(.secondary)
    }
    Spacer()
    if selectedMintURL == mint.url.absoluteString {
        Image(systemName: "checkmark.circle.fill")
            .foregroundColor(.orange)
    }
}
```

#### C. Create Invoice Button (Fixed at Bottom)

```swift
VStack {
    Divider()
    Button(action: createMintQuote) {
        if isMinting {
            HStack {
                ProgressView()
                    .scaleEffect(0.8)
                Text("Creating...")
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.orange.opacity(0.3))
            .foregroundColor(.orange)
            .cornerRadius(12)
        } else {
            Text("Create Invoice")
                .frame(maxWidth: .infinity)
                .fontWeight(.semibold)
                .padding()
                .background(Color.orange)
                .foregroundColor(.white)
                .cornerRadius(12)
        }
    }
    .disabled(!isValidAmount || isMinting)
    .padding()
}
.background(Color(.systemBackground))
```

### QR Code Generation (Invoice Display)

#### InvoiceView Component

When user taps "Create Invoice", `createMintQuote()` is called:

1. Requests a Lightning invoice quote from selected mint via `walletManager.requestMint()`
2. On success, `showInvoice` becomes `true`, presenting an `InvoiceView` sheet

```swift
NavigationStack {
    VStack(spacing: 30) {
        // Amount display
        VStack(spacing: 8) {
            Text("\(amount)")
                .font(.system(size: 48, weight: .bold))
            Text("sats")
                .font(.title3)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 40)

        // QR Code - Large display
        QRCodeView(content: invoice)

        // Invoice text
        VStack(spacing: 12) {
            Text(invoice)
                .font(.system(.caption, design: .monospaced))
                .lineLimit(3)
                .truncationMode(.middle)
                .padding()
                .background(Color.secondary.opacity(0.2))
                .cornerRadius(8)

            Button(action: copyInvoice) {
                Label(
                    copied ? "Copied!" : "Copy Invoice",
                    systemImage: copied ? "checkmark.circle.fill" : "doc.on.doc"
                )
            }
            .buttonStyle(.bordered)
            .tint(copied ? .green : .orange)
        }
        .padding(.horizontal)

        // Check Now button
        Button(action: checkNow) {
            HStack {
                if isChecking {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(0.8)
                } else {
                    Image(systemName: "arrow.clockwise")
                }
                Text("Check Payment Status")
            }
        }
        .buttonStyle(.borderedProminent)
        .tint(.orange)

        Spacer()

        // Status indicator
        VStack(spacing: 16) {
            ProgressView()
            Text("Waiting for payment...")
                .foregroundStyle(.secondary)
        }
        .padding(.bottom, 40)
    }
    .navigationTitle("Lightning Invoice")
}
```

### Backend Flow (createMintQuote)

```swift
private func createMintQuote() {
    guard let amountInt = Int(amount),
          amountInt > 0,
          !selectedMintURL.isEmpty else { return }

    isMinting = true
    Task {
        do {
            guard let wallet = walletManager.wallet else {
                throw WalletError.noActiveWallet
            }

            // Request mint quote from the wallet
            let quote = try await wallet.requestMint(
                amount: Int64(amountInt),
                mintURL: selectedMintURL
            )

            await MainActor.run {
                mintQuote = quote
                showInvoice = true
                isMinting = false
            }

            // Start monitoring for deposit
            startDepositMonitoring(quote: quote)
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                showError = true
                isMinting = false
            }
        }
    }
}
```

### Payment Monitoring

The `startDepositMonitoring()` continuously checks the status of the Lightning payment:

```swift
private func startDepositMonitoring(quote: CashuMintQuote) {
    depositTask?.cancel()

    let (triggerStream, continuation) = AsyncStream<Void>.makeStream()
    manualCheckContinuation = continuation

    depositTask = Task {
        do {
            guard let wallet = walletManager.wallet else { return }

            let depositSequence = await wallet.monitorDeposit(
                quote: quote,
                manualCheckTrigger: triggerStream
            )

            for try await status in depositSequence {
                switch status {
                case .pending:
                    print("Deposit pending for quote: \(quote.quoteId)")

                case .minted(let proofs):
                    let totalAmount = proofs.reduce(0) { $0 + Int($1.amount) }
                    await MainActor.run {
                        mintedAmount = Int64(totalAmount)
                        showInvoice = false
                        showPaymentAnimation = true
                    }
                    return

                case .expired:
                    await MainActor.run {
                        errorMessage = "Lightning invoice expired"
                        showError = true
                        showInvoice = false
                    }
                    return

                case .cancelled:
                    return
                }
            }
        } catch {
            await MainActor.run {
                walletManager.handleMintFailureError(error)
                errorMessage = "Failed to monitor deposit: \(error.localizedDescription)"
                showError = true
                showInvoice = false
            }
        }
    }
}
```

### Payment Success Animation

When payment is successful, `PaymentReceivedAnimation` is shown:

```swift
struct PaymentReceivedAnimation: View {
    let amount: Int64
    let onComplete: () -> Void

    @State private var showAmount = false
    @State private var checkmarkScale: CGFloat = 0
    @State private var amountOpacity: Double = 0
    @State private var glowOpacity: Double = 0
    @State private var ringOpacity: Double = 0
    @State private var ringScale: CGFloat = 0.8
    @State private var successTextOpacity: Double = 0

    var body: some View {
        ZStack {
            // Dark backdrop
            Color.black.opacity(0.85)
                .ignoresSafeArea()
                .onTapGesture { onComplete() }

            // Radial gradient glow
            RadialGradient(
                colors: [
                    Color.orange.opacity(glowOpacity * 0.15),
                    Color.orange.opacity(glowOpacity * 0.05),
                    Color.clear
                ],
                center: .center,
                startRadius: 100,
                endRadius: 300
            )

            VStack(spacing: 40) {
                // Animated ring with checkmark
                ZStack {
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [Color.orange.opacity(0.8), Color.orange.opacity(0.3)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 3
                        )
                        .frame(width: 120, height: 120)
                        .scaleEffect(ringScale)
                        .opacity(ringOpacity)

                    Image(systemName: "checkmark")
                        .font(.system(size: 50, weight: .semibold))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [.white, Color.orange.opacity(0.9)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .scaleEffect(checkmarkScale)
                }

                // Amount display
                VStack(spacing: 16) {
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text("\(amount)")
                            .font(.system(size: 48, weight: .semibold, design: .rounded))
                            .foregroundStyle(.white)
                        Text("sats")
                            .font(.system(size: 24, weight: .medium, design: .rounded))
                            .foregroundStyle(Color.white.opacity(0.7))
                    }
                    .opacity(amountOpacity)

                    Text("Payment Received")
                        .font(.system(size: 20, weight: .medium, design: .rounded))
                        .foregroundStyle(Color.white.opacity(0.9))
                        .opacity(successTextOpacity)
                }
            }
        }
        .onAppear {
            startElegantAnimation()
        }
    }
}
```

**Animation Sequence:**
1. Backdrop glow fades in (0.4s)
2. Ring animates (0.6s)
3. Checkmark appears with spring animation (0.3s after ring)
4. Amount fades in (0.5s after start)
5. Success text appears (0.7s after start)
6. Auto-dismiss after 2.5s

**Haptic Feedback:**
- Medium impact when checkmark appears
- Success notification when text appears

## 2. Receiving Flow (ReceiveView.swift)

### Purpose
Allows users to paste or scan an existing Cashu ecash token string and redeem it into their wallet.

### UI Components Structure

```swift
Form {
    Section("Ecash Token") {
        // Token input field
        // QR scanner button
        // Token preview
    }

    Section {
        // Redeem button
    }
}
```

### Key UI Components

#### A. Token Input Section

```swift
Section {
    VStack(alignment: .leading, spacing: 12) {
        HStack {
            TextField("Paste ecash token", text: $inputToken, axis: .vertical)
                .lineLimit(3...6)
                .font(.system(.body, design: .monospaced))

            Button(action: { showScanner = true }) {
                Image(systemName: "qrcode.viewfinder")
                    .font(.title2)
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44)
                    .background(Color.orange)
                    .cornerRadius(10)
            }
            .buttonStyle(.plain)
        }

        if !inputToken.isEmpty {
            HStack {
                Image(systemName: "banknote")
                    .foregroundStyle(.orange)
                Text("Ecash token detected")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
} header: {
    Text("Ecash Token")
} footer: {
    Text("Paste or scan an ecash token to redeem it")
}
```

#### B. Redeem Button

```swift
Section {
    Button(action: redeemToken) {
        if isProcessing {
            ProgressView()
                .frame(maxWidth: .infinity)
        } else {
            Text("Redeem Token")
                .frame(maxWidth: .infinity)
        }
    }
    .disabled(inputToken.isEmpty || isProcessing)
}
```

### Backend Flow (redeemToken)

```swift
private func redeemToken() {
    guard !inputToken.isEmpty else { return }

    isProcessing = true
    Task {
        do {
            // Redeem the token
            let amount = try await walletManager.receive(
                tokenString: inputToken.trimmingCharacters(in: .whitespacesAndNewlines)
            )

            await MainActor.run {
                receivedAmount = Int(amount)
                showSuccess = true
                isProcessing = false
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                showError = true
                isProcessing = false
            }
        }
    }
}
```

**Auto-Redeem Feature:**
```swift
.onAppear {
    if let token = tokenString {
        inputToken = token
        // Auto-redeem if token was provided
        redeemToken()
    }
}
```

### QR Scanner

The QR scanner is presented as a sheet when the scan button is tapped:

```swift
.sheet(isPresented: $showScanner) {
    QRScannerView(
        onScan: { scannedValue in
            inputToken = scannedValue
            showScanner = false
        },
        onDismiss: {
            showScanner = false
        }
    )
}
```

Note: `QRScannerView` is an alias for `NDKUIQRScanner` from the NDKSwiftUI library.

## 3. WalletManager Backend Methods

### requestMint Method

Creates a pending transaction and requests a Lightning invoice from the mint:

```swift
func requestMint(amount: Int64, mintURL: String) async throws -> CashuMintQuote {
    guard let wallet = wallet else {
        throw WalletError.noActiveWallet
    }
    guard let url = URL(string: mintURL) else {
        throw WalletError.invalidMintURL
    }

    // Create pending transaction immediately
    let pendingTx = await wallet.transactionHistory.createPendingTransaction(
        type: .mint,
        amount: amount,
        direction: .incoming,
        memo: "Mint request",
        mint: mintURL
    )

    do {
        let quote = try await wallet.requestMint(amount: amount, mint: url)

        // Update the pending transaction with the quote ID
        await wallet.transactionHistory.updateTransactionLookupKeys(
            id: pendingTx.id,
            lookupKeys: TransactionLookupKeys(quoteId: quote.quoteId)
        )

        // Update memo to include quote ID
        await wallet.transactionHistory.updateTransactionMemo(
            id: pendingTx.id,
            memo: "Mint request (Quote: \(quote.quoteId.prefix(8))...)"
        )

        return quote
    } catch {
        // Update pending transaction status to failed
        await wallet.transactionHistory.updateTransactionStatus(id: pendingTx.id, status: .failed)
        throw error
    }
}
```

### receive Method

Parses and redeems Cashu tokens:

```swift
func receive(tokenString: String) async throws -> Int64 {
    guard let wallet = wallet else {
        throw WalletError.noActiveWallet
    }

    // Parse token string to get amount first
    guard tokenString.hasPrefix("cashuA") else {
        throw WalletError.invalidToken
    }

    let base64Part = String(tokenString.dropFirst(6))
    var base64 = base64Part
        .replacingOccurrences(of: "-", with: "+")
        .replacingOccurrences(of: "_", with: "/")

    // Add padding if needed
    while base64.count % 4 != 0 {
        base64.append("=")
    }

    guard let tokenData = Data(base64Encoded: base64),
          let token = try? JSONCoding.decoder.decode(CashuSwift.Token.self, from: tokenData) else {
        throw WalletError.invalidToken
    }

    // Calculate total amount
    let totalAmount = token.proofsByMint.values.reduce(0) { sum, proofs in
        sum + proofs.reduce(0) { $0 + Int64($1.amount) }
    }

    // Create pending transaction
    let pendingTx = await wallet.transactionHistory.createPendingTransaction(
        type: .receive,
        amount: totalAmount,
        direction: .incoming,
        memo: token.memo ?? "Received ecash"
    )

    do {
        var totalReceived: Int64 = 0

        // Process proofs from each mint
        for (_, proofs) in token.proofsByMint {
            try await wallet.receive(proofs: proofs)
            totalReceived += proofs.reduce(0) { $0 + Int64($1.amount) }
        }

        // Update pending transaction status to completed
        await wallet.transactionHistory.updateTransactionStatus(id: pendingTx.id, status: .completed)

        // Create history event
        if totalReceived > 0 {
            do {
                let ndk = nostrManager.ndk
                guard let signer = ndk.signer else { return totalReceived }

                try await wallet.eventManager.createSpendingHistoryEvent(
                    direction: .in,
                    amount: totalReceived,
                    memo: token.memo ?? "Received ecash",
                    signer: signer,
                    relays: wallet.resolvedWalletRelays
                )
            } catch {
                print("Failed to create history event for receive: \(error)")
            }
        }

        return totalReceived
    } catch {
        await wallet.transactionHistory.updateTransactionStatus(id: pendingTx.id, status: .failed)
        throw error
    }
}
```

## Key Design Patterns & UX Insights

### 1. Two-Phase Input Pattern
- **Minting**: User inputs amount FIRST, then gets invoice/QR
- **Receiving**: User inputs token FIRST, then redeems (amount is embedded in token)

### 2. Progressive Disclosure
- Start with simple input (amount or token)
- Show more details only when needed (invoice sheet, success animation)
- Fixed bottom button for primary action

### 3. Visual Hierarchy
- Large, prominent amount displays (48pt font)
- Secondary info (USD equivalent, mint selection) is smaller
- Color coding: Orange for primary actions and highlights

### 4. Feedback Loops
- Immediate visual feedback (button states, progress indicators)
- Copy confirmation with color change (green checkmark)
- Success animation with haptic feedback
- Auto-dismiss after success

### 5. Error Handling
- Generic alerts for errors
- Specific handling for mint failures
- Transaction history tracks pending/failed states

### 6. Manual Override Options
- "Check Payment Status" button for manual checking
- Auto-monitoring continues in background
- Manual trigger stream for user-initiated checks

### 7. Smart Defaults
- Auto-select first mint if none selected
- Preset amount buttons for common values
- Auto-redeem if token provided on view appearance

### 8. Accessibility Considerations
- Large touch targets (44x44 for QR scanner button)
- Clear visual states (disabled, loading, success)
- Keyboard type optimization (.numberPad for amounts)
- FocusState for amount input

## Technical Architecture

### State Management
- Uses `@State` for local view state
- `@Environment` for shared managers (WalletManager)
- `@EnvironmentObject` for app-wide state (AppState)

### Async/Await Patterns
- All wallet operations are async
- Task cancellation support
- AsyncStream for payment monitoring
- Manual trigger stream for user-initiated checks

### Transaction History
- Pending transactions created immediately
- Updated with quote IDs and status
- Failed transactions marked explicitly
- Nostr events for completed transactions (NIP-60)

### Component Reuse
- `PaymentReceivedAnimation` used by both flows
- `QRCodeView` and `QRScannerView` from NDKSwiftUI library
- Shared error handling patterns

## Files Reference

### Main Implementation Files
- `Sources/NutsackiOS/Views/Wallet/MintView.swift` - Minting/deposit flow
- `Sources/NutsackiOS/Views/Wallet/ReceiveView.swift` - Token redemption flow
- `Sources/NutsackiOS/Views/Wallet/PaymentReceivedAnimation.swift` - Success animation
- `Sources/NutsackiOS/Models/WalletManager.swift` - Backend wallet operations

### Supporting Files
- `Sources/NutsackiOS/Utils/QRCodeGenerator.swift` - QR code generation (wrapper)
- `Sources/NutsackiOS/Utils/QRScannerView.swift` - QR scanner (wrapper)
- `Sources/NutsackiOS/Views/Alerts/MintFailureAlert.swift` - Error handling

### External Dependencies
- NDKSwiftUI library for QR components
- CashuSwift for Cashu protocol operations
- NDKSwift for Nostr operations
