# 🇨🇴 Colombian Spanish SRS

A Spanish practice app focused on everyday situations in Colombia. The development library contains 47 decks and 1,392 cards; the accepted release library is still pending human editorial review.

[![Cards](https://img.shields.io/badge/Cards-1,392-blue)](./src/data/decks)
[![Decks](https://img.shields.io/badge/Decks-47-green)](./src/data/decks)

## 📱 Screenshots

_(Coming soon - app is in development)_

## ✨ Features

- **1,392 flashcards** across 47 themed decks
- **Spaced repetition** with bounded daily review and resumable queues
- **Bundled generated pronunciation** with saved speed and opt-in speech after answer reveal; device speech is a fallback for ordinary cards, not a verified Colombian voice
- **Local learning and backups** — bundled card content/audio and portable progress; signed offline cold-launch/device checks remain open
- **Daily goals** — track your progress
- **Custom cards** — add your own phrases

## 📚 Content Includes

### Colombian Slang & Expressions

- Jerga Colombiana (general slang)
- Paisa slang (Medellín-specific)
- Rolo slang (Bogotá-specific)
- Costeño slang (Caribbean coast)
- Valluno/Caleño slang (Cali-specific)
- Llanero slang (Eastern Plains, needs native review)
- Piropos & compliments
- Colombian expressions & sayings
- Dating & relationship phrases

### Practical Categories

- Food & drinks (including Colombian specialties)
- Travel & emergency phrases
- Business & professional Spanish
- Culture & festivals

### Core Vocabulary

- Daily life, family, emotions
- Shopping, transport, health
- Numbers, dates, weather
- School, work, technology

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.4+ (the installed React Native requirement)
- npm or yarn
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repo
git clone https://github.com/mikepitts25/Colombian-Spanish.git
cd Colombian-Spanish

# Install dependencies
npm ci

# Start the development server
npm start
```

### Running on Device

```bash
# iOS
npm run ios

# Android
npm run android
```

## Release readiness

This is a development project. All 1,392 library cards currently await acceptance in the versioned editorial ledger; region tags can be inferred. The text mission and generated listening exercise are development-only previews. Human dialogue recordings, assessed speaking, learner efficacy and signed physical-device acceptance are not established.

Follow [MASTER_PLAN.md](MASTER_PLAN.md) for work and evidence, [COMPETITIVE_ANALYSIS.md](COMPETITIVE_ANALYSIS.md) for dated positioning, and [APP_STORE_CHECKLIST.md](APP_STORE_CHECKLIST.md) for candidate gates. File backups and local learning do not imply that the entire app never communicates externally; see [PRIVACY_POLICY.md](PRIVACY_POLICY.md) and its linked data inventory.

## 📦 Building for Production

The production content gate intentionally blocks a catalogue with no accepted cards. Do not bypass it to publish the current draft library. Signing, accounts and candidate QA are separate requirements.

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🗂️ Project Structure

```
src/
├── components/       # Reusable UI components
├── context/         # React context providers
├── data/decks/      # Flashcard content (47 decks, 1,392 cards)
├── hooks/           # Custom React hooks
├── navigation/      # Navigation configuration
├── screens/         # App screens
├── storage/         # Local storage utilities
├── styles/          # Theme and styling
├── types/           # TypeScript types
└── utils/           # Helper functions (SRS algorithm)
```

## 🧠 SRS Algorithm

This app uses a modified **SM-2** spaced repetition algorithm:

- Cards are scheduled from learner self-ratings; this is not measured unaided mastery
- Intervals increase with successful reviews
- Difficult cards appear more frequently
- Daily goals track card activity, not proficiency or proof of retention

## 🛣️ Current capability summary

[MASTER_PLAN.md](MASTER_PLAN.md) is the authoritative roadmap.

- [x] 1,000+ flashcards
- [x] SRS algorithm
- [x] Bundled generated pronunciation and optional device-speech fallback
- [ ] Native speaker audio
- [ ] Cloud sync
- [ ] Accepted conversation course (authored development mission available)
- [x] Recognition quiz with distinct observations
- [ ] Achievement system

## 🤝 Contributing

Contributions welcome! Areas where help is needed:

- Additional Colombian slang and expressions
- Audio recordings by native speakers
- UI/UX improvements
- Bug fixes and testing

## 📄 License

No LICENSE file is currently checked in. The owner must confirm intended code licensing and the separate rights for content, images and audio before distribution.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- SRS algorithm based on [SM-2](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- Inspired by Anki, Duolingo, and the need for Colombian-specific content

---

Made with ❤️ for Colombia
