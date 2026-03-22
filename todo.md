# Plush App — Project TODO

## Prompt 1: Navigation Shell, Brand System & Onboarding

### Brand System & Configuration
- [x] Update theme.config.js with Plush color tokens (Blush Pink, Deep Plum, Cream, Rose Gold)
- [x] Update tailwind.config.js to include custom colors and fonts
- [x] Configure Playfair Display, DM Sans, Dancing Script fonts in app.config.ts
- [x] Create global styles and theme provider setup
- [x] Update app.config.ts with app name "Plush" and branding info

### Screens — Onboarding Flow
- [x] Screen 0: Trust Screen (non-skippable, trust statements, CTA)
- [x] Screen 1: Splash Screen (2-second auto-advance, shimmer animation, petal particles)
- [x] Screen 2: Authentication (Sign Up / Log In tabs, social auth buttons)
- [x] Screen 3: Welcome Screen (illustration placeholder, headline, CTA)
- [x] Screen 4: Money Personality Quiz (7 questions, progress bar, soft cards)
- [x] Screen 5: Personality Result (4 archetypes, feature chips, affirmation)
- [x] Screen 6: Profile Setup (optional fields, auto-applied settings)
- [x] Screen 7: Paywall / Tier Selection (4 tier cards, badges, RevenueCat integration)
- [x] Screen 8: Push Notification Permission (pre-prompt screen)

### Navigation & Tab Bar
- [x] Build bottom tab navigation shell (5 tabs: Home, Log, Goals, Community, Profile)
- [x] Create tab icon mappings (house, sparkle, target, people, person)
- [x] Style active/inactive tab states (Deep Plum + Rose Gold underline, muted grey)
- [x] Create placeholder screens for all 5 main tabs
- [x] Create hidden screens (Rituals Hub, Ajo Circle, Insights/AI Analytics)

### Backend & Database
- [x] Set up Supabase project and users table with RLS
- [x] Configure Supabase Auth (email/password, Google, Apple)
- [ ] Integrate RevenueCat SDK for subscription management (Prompt 2)
- [ ] Wire authentication flow (sign-up → welcome → quiz → profile → paywall → home) (Prompt 2)
- [ ] Implement session persistence with AsyncStorage (Prompt 2)

### App Icons & Branding
- [x] Generate custom app logo (square, iconic, fills entire space) — NEXT STEP
- [x] Save logo to assets/images/icon.png
- [x] Copy logo to splash-icon.png, favicon.png, android-icon-foreground.png
- [x] Update app.config.ts with logoUrl (S3 URL from generate)

### Testing & Polish
- [ ] Test onboarding flow end-to-end (Trust → Splash → Auth → Welcome → Quiz → Result → Profile → Paywall → Home) — READY
- [ ] Test tab navigation and screen transitions — READY
- [ ] Verify all buttons and CTAs work — READY
- [ ] Test dark mode support — READY
- [ ] Verify responsive layout on mobile portrait — READY
- [ ] Test on iOS and Android simulators — READY

### Delivery
- [ ] Create checkpoint after completing Prompt 1
- [ ] Document any blockers or decisions for Prompt 2


## Prompt 2: Home Dashboard, AI Entry Hub, Goals & Ajo Circle

### Database Schema
- [x] Create expenses table (id, user_id, amount, merchant, category, date, type, entry_method, notes, ai_soft_comment, created_at)
- [x] Create savings_goals table (id, user_id, name, target_amount, current_amount, target_date, cover_theme, motivation_note, status, created_at)
- [x] Create ajo_circles table (id, name, creator_id, contribution_amount, frequency, max_members, payout_order, current_round, total_rounds, invite_code, status, created_at)
- [x] Create ajo_members table (id, circle_id, user_id, joined_at)
- [x] Create ajo_contributions table (id, circle_id, user_id, round_number, amount, paid_at, status)
- [x] Run database migration

### Home Dashboard (Tab 1)
- [x] Build header with time-based greeting (Good morning/afternoon/evening)
- [x] Add notification bell icon (Rose Gold)
- [x] Create Plush Score badge (Deep Plum background, circular)
- [x] Build Hero Vault Card with income/spent/saved display
- [x] Add animated circular progress ring (Rose Gold)
- [x] Implement rotating daily affirmations (Dancing Script)
- [x] Create "Log with AI ✨" floating action button
- [x] Build Spending Summary horizontal scroll (top 4 categories)
- [x] Add Savings Goals Preview section
- [x] Build Ritual Reminder Card (Sunday/Wednesday/Friday logic)
- [x] Add Upcoming Bills section
- [x] Add Community Wins preview
- [x] Implement offline caching (last 50 expenses)

### AI Entry Hub (Tab 2 - Log Screen)
- [x] Build 4 entry mode cards (Screenshot, Voice, Camera, Quick Text)
- [x] Implement paywall gates (Free/Member/AI tier logic)
- [x] Build upgrade bottom sheet for locked features
- [ ] Create Screenshot flow (photo picker → GPT-4o Vision → confirmation) (Prompt 3)
- [ ] Create Voice Note flow (recording UI → Whisper API → GPT-4o → confirmation) (Prompt 3)
- [ ] Create Camera Scan flow (live camera → receipt capture → GPT-4o) (Prompt 3)
- [ ] Create Quick Text flow (text input → GPT-4o) (Prompt 3)
- [x] Build Manual Entry fallback form
- [x] Add Recently Logged section with swipe-to-delete/edit
- [ ] Implement coin sparkle micro-animation on successful log (Prompt 3)

### Naira Naming Ceremonies (Tab 3 - Goals)
- [x] Build empty state with illustration placeholder
- [x] Create Active Goals list with progress bars
- [x] Build Create New Goal bottom sheet (4 steps)
- [x] Implement AI motivation suggestions
- [x] Build Goal Detail screen with circular progress
- [ ] Add milestone celebrations (25%, 50%, 75%, 100%) (Prompt 3)
- [ ] Create confetti animations (Prompt 3)
- [x] Add Savings Rate widget
- [ ] Implement paywall (1 goal free, unlimited = Member+) (Prompt 3)

### Ajo Circle
- [x] Build Ajo Circle empty state
- [x] Create My Circles list with status badges
- [x] Build Create Circle flow (4 steps)
- [x] Implement invite code generation (6-char)
- [x] Build Circle Detail screen with member list
- [x] Add contribution grid visualization
- [ ] Create lightweight group chat (Prompt 3)
- [ ] Implement AI circle management notifications (Prompt 3)
- [ ] Add payout celebration animations (Prompt 3)
- [ ] Build transparency features (payment history, trust summary) (Prompt 3)

## Prompt 3: Gemini API Integration for AI Entry Modes

### Gemini Setup
- [x] Add GEMINI_API_KEY to environment variables `[x]`
- [ ] Set up rate limiting and error handling
- [ ] Create utility functions for Gemini API calls

### tRPC Procedures
- [ ] Create parseScreenshot procedure (Gemini Flash/Pro Vision)
- [ ] Create transcribeVoice procedure (Note: Gemini supports audio directly)
- [ ] Create parseCamera procedure (Gemini Flash/Pro Vision)
- [ ] Create parseText procedure (Gemini Flash/Pro)
- [ ] Add error handling and retry logic

### Screenshot Entry Mode
- [ ] Implement photo picker integration
- [ ] Send image to Gemini for analysis
- [ ] Parse response for expense details (amount, merchant, category)
- [ ] Show confirmation screen with extracted data
- [ ] Save expense to database
- [ ] Add loading state and error handling

### Voice Entry Mode
- [ ] Implement audio recording UI
- [ ] Send audio to Gemini for transcription/parsing
- [ ] Show confirmation screen with extracted data
- [ ] Save expense to database
- [ ] Add loading state and error handling

### Camera Entry Mode
- [ ] Implement live camera UI
- [ ] Capture receipt/bill image
- [ ] Send image to Gemini for analysis
- [ ] Parse response for expense details
- [ ] Show confirmation screen with extracted data
- [ ] Save expense to database
- [ ] Add loading state and error handling

### Text Entry Mode
- [ ] Implement text input form
- [ ] Send text to Gemini for parsing
- [ ] Extract expense details from natural language
- [ ] Show confirmation screen with extracted data
- [ ] Save expense to database
- [ ] Add loading state and error handling

### UI/UX Enhancements
- [ ] Add loading spinners during API calls
- [ ] Implement success animations (coin sparkles)
- [ ] Add error toast notifications
- [ ] Create confirmation screens for all entry modes
- [ ] Add retry buttons on failed API calls

### Testing
- [ ] Test Screenshot mode with various receipt images
- [ ] Test Voice mode with different accents/audio quality
- [ ] Test Camera mode with live camera
- [ ] Test Text mode with various expense descriptions
- [ ] Test error handling and fallback UI
- [ ] Verify all expenses are saved correctly


## Bug Fixes & Testing (From App Preview Review)

### Issues Identified
- [ ] Tab navigation may not be routing correctly to all screens
- [ ] "Log with AI" button routing needs verification
- [ ] Ritual reminders section may be missing or scrolled off
- [ ] Upcoming bills section visibility needs checking
- [ ] Community wins preview not visible in Home Dashboard
- [ ] Tab bar icons need verification against design
- [ ] Dark/light mode toggle needs testing
- [ ] Spending category cards interactivity needs testing
- [ ] Home Dashboard scroll behavior needs fixing

### Fixes to Implement
- [ ] Verify all tab routes are correctly configured in _layout.tsx
- [ ] Ensure Home Dashboard ScrollView is working properly
- [ ] Add missing sections to Home Dashboard if not rendering
- [ ] Test all CTA buttons and navigation flows
- [ ] Fix theme toggle functionality
- [ ] Test responsive layout on different screen sizes
- [ ] Verify all mock data is displaying correctly
- [ ] Test form submissions and error handling


## UI Beautification & Navigation Wiring

### UI Improvements
- [ ] Beautify Home Dashboard with card-based design and improved spacing
- [ ] Beautify Log screen with refined card design
- [ ] Fix Goals progress bar (horizontal, Rose Gold #B76E79, 12px height)
- [ ] Beautify Community and Profile screens
- [ ] Apply consistent typography and spacing across all screens
- [ ] Verify 5 nav buttons are working correctly (Home, Log, Goals, Community, Profile)

### Navigation & Authentication Flow
- [ ] Wire Splash Screen to auto-advance after 2 seconds
- [ ] Link Splash → Trust Screen for first-time users
- [ ] Link Trust Screen → Auth Screen (Sign Up / Log In)
- [ ] Link Auth Screen → Welcome Screen after successful auth
- [ ] Link Welcome → Money Personality Quiz
- [ ] Link Quiz → Personality Result
- [ ] Link Personality Result → Profile Setup
- [ ] Link Profile Setup → Paywall / Tier Selection
- [ ] Link Paywall → Push Notification Permission
- [ ] Link Notifications → Home Dashboard (customer journey starts)
- [ ] Implement returning user flow (Splash → Auth check → Home)
- [ ] Add session persistence with AsyncStorage
- [ ] Test all navigation flows end-to-end
