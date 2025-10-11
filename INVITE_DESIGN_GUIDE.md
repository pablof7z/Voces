# Invite System Design Guide

## Quick Navigation

### Testing the Invite Creator
1. Start dev server: `npm run dev`
2. Log in to the app
3. Click your avatar in the sidebar
4. Select "Create Invite"
5. Choose from 4 different design variations

### Testing Onboarding Flows
Visit any of these URLs directly (no login needed):

| URL | Style | Vibe | Best For |
|-----|-------|------|----------|
| `/i-1/test123` | Minimalist Elegant | Professional, clean | Business-oriented users |
| `/i-2/test123` | Playful Animated | Fun, energetic | Younger audience, casual users |
| `/i-3/test123` | Tech Terminal | Hacker, technical | Developers, tech enthusiasts |
| `/i-4/test123` | Values-Driven | Principled, mission-focused | Privacy advocates, activists |
| `/i-5/test123` | Card Storytelling | Warm, friendly | General audience, storytellers |

---

## Design Philosophy by Variation

### Invite Creation Flows

#### 1️⃣ Minimalist
**Philosophy**: Less is more
- Single-screen efficiency
- Clear visual hierarchy
- Subtle animations
- Professional gray/white palette
- **Target**: Power users who value speed

#### 2️⃣ Wizard
**Philosophy**: Guided confidence
- Progressive disclosure
- Clear progress indication
- Smooth transitions
- Gradient accents (blue→purple→pink)
- **Target**: First-time invite creators

#### 3️⃣ Glassmorphism
**Philosophy**: Bold & modern
- Eye-catching aesthetics
- Frosted glass effects
- Vibrant backgrounds
- High visual impact
- **Target**: Users who want to make a statement

#### 4️⃣ Social Proof
**Philosophy**: Community-driven
- Stats and impact metrics
- Split-screen storytelling
- Social validation
- Warm orange/pink palette
- **Target**: Community builders and influencers

---

### Onboarding Flows

#### 1️⃣ Minimalist Elegant
**Philosophy**: Respectful simplicity
- Clean, uncluttered
- Focus on the inviter
- Straightforward progression
- **Perfect for**: Professional networks, serious communities

**Flow**: Welcome → Profile → Complete
**Duration**: ~30 seconds

#### 2️⃣ Playful Animated
**Philosophy**: Joy & excitement
- Floating emojis
- Bright gradients
- Celebration moments
- Multiple micro-interactions
- **Perfect for**: Social communities, fun-focused groups

**Flow**: Welcome → Name → About → Setup → Celebrate
**Duration**: ~60 seconds

#### 3️⃣ Tech Terminal
**Philosophy**: Power & control
- Matrix aesthetic
- Technical transparency
- System information display
- Boot sequence immersion
- **Perfect for**: Developer communities, tech early adopters

**Flow**: Boot → Welcome → Profile → Processing → Complete
**Duration**: ~45 seconds (includes boot animation)

#### 4️⃣ Values-Driven
**Philosophy**: Purpose & principles
- Side-by-side inviter + values
- Educational component
- Emphasis on decentralization
- **Perfect for**: Mission-driven communities, activists

**Flow**: Welcome + Values → Profile → Complete
**Duration**: ~40 seconds

#### 5️⃣ Card Storytelling
**Philosophy**: Narrative progression
- Card flip transitions
- Feature education built-in
- Warm, approachable
- Progress indicators
- **Perfect for**: General audience, newcomers to Nostr

**Flow**: Intro → Why Agora → Setup → Ready
**Duration**: ~50 seconds

---

## Color Psychology

### Purple Gradients
- **Meaning**: Creativity, luxury, wisdom
- **Used in**: Wizard, Playful, Values-Driven
- **Effect**: Feels premium and imaginative

### Blue Gradients
- **Meaning**: Trust, stability, calm
- **Used in**: Wizard, Tech (accents)
- **Effect**: Professional and reliable

### Pink/Orange Gradients
- **Meaning**: Warmth, friendliness, energy
- **Used in**: Glassmorphism, Social Proof, Storytelling
- **Effect**: Approachable and inviting

### Green (Terminal)
- **Meaning**: Growth, tech, hacker culture
- **Used in**: Tech Terminal
- **Effect**: Technical credibility

---

## Animation Patterns

### Entrance Animations
- **Fade + Slide**: Smooth, professional (Minimalist)
- **Scale + Rotate**: Playful, energetic (Playful)
- **Opacity + Terminal**: Sequential, technical (Tech)
- **Flip**: Storytelling, card-based (Storytelling)

### Micro-interactions
- **Hover scales**: All variations use subtle scale on hover
- **Button presses**: Scale down on tap for tactile feedback
- **Success states**: Check marks with spring animations
- **Progress**: Smooth width/height transitions

### Loading States
- **Playful**: Step-by-step checklist with staggered delays
- **Tech**: Terminal-style sequential output
- **All**: Skeleton states and shimmer effects where applicable

---

## Copywriting Variations

### Minimalist
- Tone: Professional, concise
- Example: "Create Invite" / "Generate Invite"

### Playful
- Tone: Enthusiastic, emoji-friendly
- Example: "Let's Go!" / "You're In! 🎉"

### Tech
- Tone: Technical, system-like
- Example: "Initialize Account" / "ACCESS GRANTED"

### Values-Driven
- Tone: Principled, educational
- Example: "Join the Movement" / "Welcome to the decentralized revolution"

### Storytelling
- Tone: Warm, friendly
- Example: "I'm Ready!" / "You're In! 🎉"

---

## Responsive Design

All variations are fully responsive with:
- Mobile-first approach
- Breakpoints at `md:` (768px)
- Touch-friendly button sizes (min 44px height)
- Readable font sizes (min 14px for body)
- Proper spacing on small screens

---

## Accessibility Considerations

✅ Color contrast ratios meet WCAG AA standards
✅ Focus states visible on all interactive elements
✅ Semantic HTML structure
✅ Keyboard navigation supported
✅ Screen reader friendly labels
✅ Motion can be reduced via prefers-reduced-motion

---

## Technical Implementation

### Dependencies Used
- **Framer Motion**: All animations
- **Lucide React**: All icons
- **Radix UI**: Dialog, dropdown components
- **Tailwind CSS**: All styling
- **React Router**: Navigation

### Performance
- Lazy loading ready (code splitting by route)
- Optimized animations (transform/opacity only)
- No layout thrashing
- Smooth 60fps animations

---

## Next Steps for Production

### Backend Integration
1. Implement kind 420 event publishing
2. Add symmetric encryption (AES-GCM)
3. Generate secure random keys
4. Fetch and decrypt invites
5. Publish kind 421 confirmation events

### Data Flow
1. User creates invite → Generate random dTag
2. If personalized → Encrypt payload with 24-byte key
3. Publish kind 420 event
4. Generate shareable URL
5. Invitee visits URL → Fetch event
6. Decrypt payload (if key in URL)
7. Create identity → Copy follows/mints
8. Publish kind 421 → Track invite success

### UX Improvements
- Add QR code generation for mobile sharing
- Social share buttons (Twitter, Telegram, etc.)
- Invite link preview generation
- Usage analytics (how many times viewed/used)
- Invite expiration options
- Batch invite creation

---

## Recommendation

Based on the mockups created, here's a suggested approach:

**For Invite Creation**: 
- Primary: **Variation 2 (Wizard)** - Best balance of guidance and delight
- Alternative: **Variation 1 (Minimalist)** - For power users (add as "Quick Mode")

**For Onboarding**:
- Primary: **Variation 2 (Playful)** - Most engaging and memorable
- Alternative: **Variation 1 (Minimalist)** - Professional fallback
- Special: **Variation 3 (Tech)** - For technical invites/communities

**Strategy**: 
Let invite creators choose the onboarding style when they create the invite, so they can match the experience to their audience.