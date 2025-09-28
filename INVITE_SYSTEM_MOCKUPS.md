# Invite System UI Mockups

This document describes the various UI mockups created for the Voces invite system.

## Access Points

### Create Invite Modal
- **Location**: User dropdown menu (click on your avatar in the sidebar)
- **Entry Point**: "Create Invite" option with UserPlus icon
- **Variations**: 4 different design styles to choose from

## Invite Creation Flow Variations

### Variation 1: Minimalist Single-Step
**Style**: Clean, elegant, single-page flow  
**Features**:
- Simple two-option selector (General vs Personalized)
- Inline form with all fields visible
- Subtle gradients and clean typography
- Professional, business-like aesthetic

**Use Case**: Users who want quick, straightforward invite creation

---

### Variation 2: Multi-Step Wizard
**Style**: Guided step-by-step experience with animations  
**Features**:
- Progress bar showing current step
- Smooth slide animations between steps
- Visual feedback with icons for each step
- Gradient backgrounds (blue → purple → pink)
- Celebratory final screen with animated success state

**Steps**:
1. Choose invite type
2. Write welcome message
3. Personalize (if applicable)
4. View generated link

**Use Case**: Users who prefer guided experiences with clear progression

---

### Variation 3: Ultra-Modern Glassmorphism
**Style**: Bold colors with glassmorphic elements  
**Features**:
- Animated gradient background
- Glassmorphic (frosted glass) panels
- White text on colorful backgrounds
- Toggle-style invite type selector
- Dramatic visual presence

**Use Case**: Users who want a cutting-edge, visually striking interface

---

### Variation 4: Social Proof
**Style**: Split-screen layout with stats and impact metrics  
**Features**:
- Left sidebar with vibrant gradient background
- Social proof stats (invites sent, rank)
- Inspirational quote
- Clean form on the right side
- Warm color palette (orange → pink → purple)

**Use Case**: Users motivated by community building and seeing their impact

---

## Onboarding Flow Variations

Test these by visiting the URLs directly with any code (e.g., `/i-1/test123`)

### /i-1/:code - Minimalist Elegant
**Style**: Clean, professional, serif-influenced  
**Features**:
- Simple white/black backgrounds
- Large, clear typography
- Step-by-step progression (Welcome → Profile → Complete)
- Inviter branding with avatar and name
- Checklist showing setup progress
- Pre-filled fields from encrypted payload

**User Journey**:
1. See inviter's welcome message
2. View personalized message (if applicable)
3. Fill in profile details (name, about)
4. See completion checklist
5. Enter the app

---

### /i-2/:code - Playful Animated
**Style**: Fun, energetic, emoji-filled  
**Features**:
- Gradient backgrounds (blue → purple → pink)
- Floating emoji animations
- Multi-step cards with transitions
- Pulsing/rotating animations on avatars
- Celebratory completion screen
- Large, friendly typography

**User Journey**:
1. Animated welcome with inviter's avatar
2. Enter name with fun animations
3. Describe yourself (optional)
4. Setup progress animation
5. Celebration screen with confetti vibe

---

### /i-3/:code - Ultra-Modern Tech
**Style**: Terminal/hacker aesthetic with green/purple theme  
**Features**:
- Matrix-inspired green terminal text
- Boot sequence animation
- Scanline effects
- System status displays
- Monospace fonts
- Technical progress indicators
- Glassmorphic panels with tech aesthetic

**User Journey**:
1. Boot sequence with loading animation
2. Welcome screen with system info
3. Profile configuration (terminal-style)
4. Processing with real-time status updates
5. Access granted screen with system details

---

### /i-4/:code - Values-Driven
**Style**: Split-screen with emphasis on platform values  
**Features**:
- Two-column layout on desktop
- Values showcase with icons
- Purple/pink gradient themes
- Emphasis on decentralization principles
- Clean, modern card design

**User Journey**:
1. Welcome screen with inviter + platform values
2. Profile creation
3. Success screen with feature checklist

---

### /i-5/:code - Card Storytelling
**Style**: Card-flip animations with warm orange/pink gradients  
**Features**:
- Card-based progression indicator
- Flip animations between steps
- Warm color palette (orange → pink → purple)
- Feature explanations
- Friendly, approachable tone

**User Journey**:
1. Intro card with inviter branding
2. "Why Voces?" feature showcase
3. Setup form
4. Ready screen with rotating star icon

---

### /i-6/:code - Luxury Premium
**Style**: Sophisticated, high-end with gold/amber accents  
**Features**:
- Black background with amber/gold accents
- Serif typography for elegance
- "Exclusive invitation" framing
- Premium badge styling
- Subtle ambient animations
- Grid-based status displays

**User Journey**:
1. Welcome with exclusivity framing
2. Profile creation with luxury aesthetic
3. Premium completion screen with "access unlocked" theme

---

## Mock Data

All variations use consistent mock data:

**Inviter**:
- Name: Pablo
- Pubkey: `09d48a1a5dbe13404a729634f1d6ba722d40513468dd713c8ea38ca9b7b6f2c7`
- Welcome message: (varies by variation)

**Encrypted Payload** (for personalized invites):
```json
{
  "name": "Tim Garfield",
  "message": "(varies by variation)",
  "cashu": "cashuA..."
}
```

## Testing URLs

Visit these URLs to see each onboarding variation:

- **Minimalist Elegant**: http://localhost:5173/i-1/test123
- **Playful Animated**: http://localhost:5173/i-2/test123  
- **Tech Terminal**: http://localhost:5173/i-3/test123
- **Values-Driven**: http://localhost:5173/i-4/test123
- **Card Storytelling**: http://localhost:5173/i-5/test123
- **Luxury Premium**: http://localhost:5173/i-6/test123

For invite creation, log in and click your avatar → "Create Invite"

## Design Tokens Used

### Colors
- Purple gradients: from-purple-500 to-purple-600
- Pink gradients: from-pink-500 to-pink-600
- Blue gradients: from-blue-500 to-blue-600
- Green (tech): from-green-400 to-green-500
- Orange (warm): from-orange-500 to-pink-500
- Amber (luxury): from-amber-400 to-orange-500

### Animations
- Framer Motion for smooth transitions
- Scale, rotate, and slide effects
- Stagger delays for sequential reveals
- Spring physics for natural movement
- Ambient background animations

### Typography
- Headlines: font-black (900 weight)
- Luxury: font-serif for elegance
- Subheadings: font-bold (700 weight)
- Body: font-medium (500 weight)
- Tech variation: font-mono

## Next Steps

1. Review each variation in the browser
2. Get user feedback on preferred styles
3. Select winning designs for each flow
4. Implement backend logic for:
   - Generating kind 420 events
   - Symmetric encryption/decryption
   - Publishing kind 421 confirmation events
   - Copying follows and mints
   - Setting up NIP-60 wallet

## File Structure

```
src/
├── features/
│   └── invites/
│       ├── CreateInviteModal.tsx (Variation selector)
│       └── variations/
│           ├── InviteVariation1.tsx (Minimalist)
│           ├── InviteVariation2.tsx (Wizard)
│           ├── InviteVariation3.tsx (Glassmorphism)
│           └── InviteVariation4.tsx (Social Proof)
└── pages/
    └── invites/
        ├── InviteOnboarding1.tsx (Minimalist Elegant)
        ├── InviteOnboarding2.tsx (Playful Animated)
        ├── InviteOnboarding3.tsx (Tech Terminal)
        ├── InviteOnboarding4.tsx (Values-Driven)
        ├── InviteOnboarding5.tsx (Card Storytelling)
        └── InviteOnboarding6.tsx (Luxury Premium)
```

## Summary

**Total Variations Created**:
- 4 invite creation flow styles
- 6 onboarding experience styles
- All using mock data
- All fully responsive
- All with smooth animations

**Key Features Demonstrated**:
✅ Inviter branding (avatar, name)
✅ Welcome message display
✅ Encrypted payload handling (name pre-fill)
✅ Cashu token integration UI
✅ Profile creation steps
✅ Follow network copying concept
✅ Wallet setup indication
✅ Professional, polished designs
✅ Multiple aesthetic approaches
✅ Wide range of emotional tones (professional → playful → technical → luxurious)