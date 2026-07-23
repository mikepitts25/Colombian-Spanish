# 🇨🇴 Colombian Spanish SRS

Learn real Colombian Spanish with 1,300+ flashcards covering slang, expressions, food, culture, and more!

[![Cards](https://img.shields.io/badge/Cards-1,372-blue)](./src/data/decks)
[![Decks](https://img.shields.io/badge/Decks-46-green)](./src/data/decks)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 📱 Screenshots

_(Coming soon - app is in development)_

## ✨ Features

- **1,372 flashcards** across 46 themed decks
- **Spaced Repetition System (SRS)** for efficient learning
- **Text-to-speech** pronunciation with Colombian accent
- **Offline-first** — learn anywhere, no internet needed
- **Daily goals** — track your progress
- **Custom cards** — add your own phrases

## 📚 Content Includes

### Colombian Slang & Expressions

- Jerga Colombiana (general slang)
- Paisa slang (Medellín-specific)
- Rolo slang (Bogotá-specific)
- Costeño slang (Caribbean coast)
- Valluno/Caleño slang (Cali-specific)
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

- Node.js 18+
- npm or yarn
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repo
git clone https://github.com/mikepitts25/Colombian-Spanish.git
cd Colombian-Spanish

# Install dependencies
npm install

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

## 📦 Building for Production

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
├── data/decks/      # Flashcard content (46 decks, 1,372 cards)
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

- Cards are scheduled based on your performance
- Intervals increase with successful reviews
- Difficult cards appear more frequently
- Daily study goals keep you on track

## 🛣️ Roadmap

- [x] 1,000+ flashcards
- [x] SRS algorithm
- [x] Text-to-speech
- [ ] Native speaker audio
- [ ] Cloud sync
- [ ] Conversation practice mode
- [ ] Quiz mode
- [ ] Achievement system

## 🤝 Contributing

Contributions welcome! Areas where help is needed:

- Additional Colombian slang and expressions
- Audio recordings by native speakers
- UI/UX improvements
- Bug fixes and testing

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- SRS algorithm based on [SM-2](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- Inspired by Anki, Duolingo, and the need for Colombian-specific content

---

Made with ❤️ for Colombia
