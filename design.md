# Plush App — Interface Design & Architecture

## Brand Identity

| Element | Value |
|---------|-------|
| **App Name** | Plush |
| **Tagline** | "Soft life, secured." |
| **Primary Color** | Blush Pink #F4B8C1 |
| **Secondary Color** | Deep Plum #4A1560 |
| **Background** | Cream/Ivory #FAF5EF |
| **Accent** | Rose Gold #B76E79 |
| **Headline Font** | Playfair Display (elegant serif) |
| **Body Font** | DM Sans (clean sans-serif) |
| **Accent Font** | Dancing Script (handwritten, motivational text only) |
| **Visual Style** | Soft gradients, no harsh edges, delicate floral accents, Rose Gold shimmer, velvet textures |
| **Aesthetic** | Glossier meets Nigerian old money meets luxury planner |

---

## Screen List & User Flows

### Onboarding Flow (First Launch)

1. **Trust Screen** (Screen 0)
   - Full-screen cream background
   - Headline: "Before we start, let's be clear." (Playfair Display, Deep Plum)
   - Three trust statements with soft pink tick ✦
   - Affirmation in Dancing Script (Rose Gold)
   - Non-skippable CTA: "I'm in 🌸"

2. **Splash Screen** (Screen 1)
   - Deep Plum background with velvet texture
   - "Plush" in Playfair Display (white, Rose Gold shimmer)
   - Tagline in Dancing Script (Blush Pink)
   - Floating petal animation
   - Auto-advances after 2 seconds

3. **Authentication** (Screen 2)
   - Cream background
   - Toggle tabs: Sign Up | Log In
   - Sign Up: First name, Email, Phone (+234), Password, Social auth (Google/Apple)
   - Log In: Email, Password, Forgot password link
   - Backend: Supabase Auth + RevenueCat

4. **Welcome Screen** (Screen 3)
   - Cream background
   - Placeholder illustration (300x300px, Nigerian woman, warm lighting)
   - Headline: "Welcome to your Plush Era. 🌸"
   - Subtext: "The first financial wellness app built for Nigerian women..."
   - CTA: "Enter your Plush Era"

5. **Money Personality Quiz** (Screen 4)
   - 7 questions, one per screen
   - Progress bar (Rose Gold fill)
   - Question in Playfair Display (Deep Plum)
   - Answer options as soft cards with Deep Plum border on selection
   - Smooth forward transitions

6. **Personality Result** (Screen 5)
   - Display one of 4 archetypes based on quiz answers
   - Archetype title (Playfair Display, Deep Plum)
   - 2-sentence description (DM Sans)
   - 3 feature chips (Rose Gold background)
   - Affirmation (Dancing Script, Rose Gold)
   - CTA: "This is me. Let's go. 🌸"
   - Store result in Supabase users table

7. **Profile Setup** (Screen 6)
   - Heading: "Let's set up your vault, love." (Playfair Display, Deep Plum)
   - Optional fields: First name, Monthly income range, Money goal, Profile photo
   - Auto-applied settings: Currency (₦), Timezone (WAT), Date format (DD/MM/YYYY)
   - Skip option or "Set up my vault 🌸" button

8. **Paywall / Tier Selection** (Screen 7)
   - Heading: "Choose your Plush Era."
   - 4 tier cards (scrollable vertical list):
     - **Plush Free** (₦0): Basic logging, 1 goal, read-only community
     - **Plush Member** (₦1,200/mo or ₦10,000/yr) — Most Popular badge
     - **Plush AI** (₦3,000/mo or ₦25,000/yr)
     - **Plush Society** (₦8,000/mo or ₦70,000/yr) — Most Exclusive badge
   - RevenueCat integration for paid tiers

9. **Push Notification Permission** (Screen 8)
   - Pre-prompt screen before native dialog
   - Soft phone icon with notification bell
   - Text: "Plush needs to reach you..."
   - CTA: "Yes, keep me in the loop" → native dialog
   - Text link: "Maybe later"

### Main App Navigation (After Onboarding)

**Bottom Tab Bar** (5 tabs, soft icons)
- Tab 1: **Home** (house icon)
- Tab 2: **Log** (sparkle/star icon)
- Tab 3: **Goals** (target icon)
- Tab 4: **Community** (people icon)
- Tab 5: **Profile** (person icon)

**Active Tab State:** Deep Plum icon + Rose Gold underline dot
**Inactive Tab State:** Muted grey icon

### Main Tab Screens (Placeholder Shells for Prompt 1)

- **Home Screen** — Dashboard with score badge, ritual reminders, quick actions
- **Log Screen** — Expense/income entry interface
- **Goals Screen** — Savings goals and financial targets
- **Community Screen** — Social feed and community engagement
- **Profile Screen** — User settings and preferences

### Hidden Screens (Accessible from Main Screens)

- **Rituals Hub** — Accessible from ritual reminder card on Home
- **Ajo Circle** — Accessible from Community tab
- **Insights/AI Analytics** — Accessible from Profile or Home score badge

---

## Personality Archetypes

| Archetype | Description | Features | Affirmation |
|-----------|-------------|----------|------------|
| **The Soft Strategist** | Earns well, can't account for where it goes. Ambitious, needs clarity. | Plush Score · AI Logging Speed · Naira Naming Ceremony | "You don't have a money problem. You have a clarity problem. Plush fixes that." |
| **The Side Hustle Visionary** | Multiple variable income streams. Can't answer "how much did I make last month?" | Multi-stream Income Logging · AI Voice Entry · Monthly PDF Report | "You work hard across every stream. Now watch Plush show you what it all adds up to." |
| **The Soft Life Girl** | Wants aesthetic AND security. Refuses to choose. | Plush Score Share Card · Owambe Budget Blessing · Naira Naming Ceremony | "Plush girls look plush AND stack plush. You never have to choose again." |
| **The Vault Builder** | Had a financial setback, rebuilding. Carries undeserved shame. | Debt Planner · No-Judgment Tracking · Plush Wins Community | "She was not bad with money. Her money was just never clear to her. This is for you." |

---

## Subscription Tiers

| Tier | Price | Features | Limit |
|------|-------|----------|-------|
| **Plush Free** | ₦0 forever | Basic logging (10/mo), 1 goal, read-only community, Sunday rituals | 10 entries/month |
| **Plush Member** | ₦1,200/mo or ₦10,000/yr | Unlimited tracking, AI text entry, 8 rituals, full community, bill tracker, Plush Score, Ajo Circle, Vault Twins | Unlimited |
| **Plush AI** | ₦3,000/mo or ₦25,000/yr | Everything in Member + screenshot scanning, voice entry (Pidgin), camera scan, Ask Plush AI, PDF reports, predictive insights, Owambe Budget Blessing | Unlimited |
| **Plush Society** | ₦8,000/mo or ₦70,000/yr | Everything in AI + weekly coaching, investment tracker, Naira Inflation Shield, founder access, early features | Limited to 200 members |

---

## Key Design Principles

1. **Mobile Portrait Orientation (9:16)** — All screens designed for one-handed usage
2. **Apple HIG Compliance** — Feels like a first-party iOS app
3. **Soft Luxury Aesthetic** — Gradients, no harsh edges, delicate accents
4. **Nigerian Cultural Resonance** — Owambe, Ajo, Naira-specific features
5. **Non-Skippable Trust** — Users must acknowledge data privacy before proceeding
6. **Personality-First Onboarding** — Quiz results drive feature recommendations
7. **Accessibility** — Clear typography hierarchy, sufficient contrast, readable text sizes

---

## Database Schema (Supabase)

### Users Table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `email` | text | Unique, from Supabase Auth |
| `phone` | text | Optional, +234 format |
| `name` | text | Display name |
| `avatar_url` | text | Optional profile photo |
| `money_personality` | text | Archetype (e.g., "The Soft Strategist") |
| `monthly_income_range` | text | Selected range (₦0–50k, etc.) |
| `subscription_tier` | text | "free", "plush_member", "plush_ai", "plush_society" |
| `created_at` | timestamp | Account creation |
| `updated_at` | timestamp | Last update |

**RLS Policy:** Users can only see/edit their own row.

---

## Implementation Notes

- **Fonts:** Use Expo's font loading for Playfair Display, DM Sans, Dancing Script
- **Icons:** Map SF Symbols to Material Icons in `icon-symbol.tsx`
- **Colors:** Define all tokens in `theme.config.js`, use via Tailwind + `useColors()` hook
- **Animations:** Subtle, 80-300ms duration (petal float, shimmer, transitions)
- **State Management:** React Context + AsyncStorage for local state; Supabase for user data
- **Auth Flow:** Supabase Auth handles sign-up/login; store user session in AsyncStorage
- **Subscription:** RevenueCat SDK for in-app purchases; verify entitlements on app launch
