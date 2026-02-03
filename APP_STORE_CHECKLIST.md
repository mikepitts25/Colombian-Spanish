# 🚀 App Store Launch Checklist

## App Information
- **App Name**: Colombian Spanish
- **Subtitle**: Learn Colombian slang & expressions
- **Bundle ID**: com.mikepitts.colombianspanish
- **Version**: 1.0.0
- **Content Rating**: 4+ (Everyone)
- **Primary Category**: Education
- **Secondary Category**: Travel

## ✅ Required Assets

### App Icons
- [ ] iOS App Icon (1024x1024 px) → `assets/icon.png`
- [ ] iOS Settings Icon (58x58, 87x87)
- [ ] iOS Spotlight Icon (80x80, 120x120)
- [ ] Android Adaptive Icon → `assets/adaptive-icon.png`
  - [ ] Foreground (108x108 dp)
  - [ ] Background color: #0f172a
- [ ] Favicon (16x16, 32x32) → `assets/favicon.png`

### Screenshots Required

#### iPhone (6.7" Display - iPhone 14 Pro Max)
- [ ] Screenshot 1: Home screen with "Due Today" visible
- [ ] Screenshot 2: Study screen with flashcard
- [ ] Screenshot 3: Category view with multiple decks
- [ ] Screenshot 4: Match view / Stats view
- [ ] Screenshot 5: Add card screen

#### iPhone (6.5" Display - iPhone 11 Pro Max, XS Max)
- [ ] Same 5 screenshots, resized

#### iPhone (5.5" Display - iPhone 8 Plus)
- [ ] Same 5 screenshots, resized

#### iPad (12.9" & 11")
- [ ] Same 5 screenshots, iPad layout

#### Android (Optional but recommended)
- [ ] Phone screenshots (16:9 or 9:16)
- [ ] 7-inch tablet screenshots
- [ ] 10-inch tablet screenshots

### Preview Video (Optional)
- [ ] 15-30 second demo video showing the app flow

## ✅ App Store Metadata

### App Store Connect (iOS)
- [ ] App name: Colombian Spanish
- [ ] Subtitle: Learn Colombian slang & expressions
- [ ] Promotional text: "Master 1,000+ Colombian expressions, slang, and phrases. The only app focused on real Colombian Spanish."
- [ ] Description: (See below)
- [ ] Keywords: colombian spanish, learn spanish, colombia, slang, medellin, bogota, spanish phrases
- [ ] Support URL: [Your website or GitHub]
- [ ] Marketing URL: [Optional]
- [ ] Privacy Policy URL: [Host on GitHub Pages]

### Google Play Store (Android)
- [ ] Short description (80 chars max)
- [ ] Full description (See below)
- [ ] Feature graphic (1024x500)
- [ ] Promo video (YouTube link)

### App Description Template

```
Learn real Colombian Spanish with 1,000+ flashcards covering slang, expressions, food, culture, and more!

Why Colombian Spanish?
• Colombia is known for having the clearest Spanish accent
• Colombian slang ("parce", "chimba", "bacano") is used across Latin America
• Essential for travel, dating, or connecting with Colombian family

What's inside:
• 1,000+ flashcards across 35 decks
• Spaced Repetition System (SRS) for efficient learning
• Authentic Colombian expressions & slang
• Paisa slang from Medellín
• Food, culture & festival vocabulary
• Dating & relationship phrases
• Business & professional Spanish
• Travel & emergency phrases

Features:
✓ Learn offline - no internet required
✓ Text-to-speech pronunciation
✓ Track daily progress
✓ Custom card creation
✓ Smart review scheduling

Perfect for:
• Traveling to Colombia
• Dating a Colombian
• Connecting with Colombian family
• Expanding your Spanish vocabulary

¡Vamos! Start speaking like a true Colombian.

Privacy: All data stays on your device. No accounts, no tracking, no internet required.
```

## ✅ Build & Submit

### iOS
- [ ] Run `expo prebuild` to generate iOS project
- [ ] Configure signing certificates in Xcode
- [ ] Build with `eas build --platform ios`
- [ ] Test on TestFlight
- [ ] Submit to App Store Review

### Android
- [ ] Run `expo prebuild` to generate Android project
- [ ] Build with `eas build --platform android`
- [ ] Test APK on physical device
- [ ] Upload to Google Play Console
- [ ] Submit for review

## ✅ Pre-Launch Testing

### Device Testing
- [ ] Test on iPhone (iOS 16+)
- [ ] Test on Android (Android 10+)
- [ ] Test tablet layout (iPad)
- [ ] Test dark mode
- [ ] Test offline functionality
- [ ] Test text-to-speech

### Content Testing
- [ ] Verify all 1,016 cards load
- [ ] Test all 35 decks
- [ ] Verify SRS scheduling works
- [ ] Test custom card creation
- [ ] Test daily progress tracking

## ✅ Post-Launch

### Marketing
- [ ] Post on Reddit (r/Colombia, r/Spanish, r/languagelearning)
- [ ] Share on Twitter/X
- [ ] Update GitHub README with App Store links
- [ ] Create landing page (optional)

### Analytics (Optional)
- [ ] Set up App Store Connect analytics
- [ ] Set up Google Play Console analytics

### Future Updates
- [ ] Plan v1.1 content additions
- [ ] Native speaker audio recordings
- [ ] Additional regional slang (Costeño, Rolo)
- [ ] Conversation practice mode

## 💰 Monetization Strategy

### Free Version
- First 7 decks free (~200 cards)
- All features enabled
- Ads optional (don't implement for v1)

### Premium ($4.99 one-time)
- Unlock all 35 decks (1,016 cards)
- Future content updates
- Remove ads (if added later)
- Cloud backup (if implemented)

### Implementation
- [ ] Add RevenueCat for IAP
- [ ] Set up paywall screen
- [ ] Configure App Store IAP
- [ ] Configure Google Play IAP

---

## Quick Commands

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Local iOS testing
expo run:ios

# Local Android testing  
expo run:android
```
