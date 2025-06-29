# FlipCymru - Welsh Learning App

FlipCymru is a comprehensive Welsh language learning web application that combines interactive flashcards, real-time translation, AI-powered conversations, and gamified learning experiences. The platform provides an engaging, modern interface for users to master Welsh through multiple interactive methods while tracking their progress and achievements.

## 🌟 Features

### Core Learning Features
- **Interactive Flashcard System**: Swipeable flashcards with spaced repetition algorithm
- **Live Translation Hub**: Instant Welsh-English translation with voice support
- **AI Conversation Practice**: Adaptive difficulty conversations with real-time feedback
- **Custom Flashcard Creation**: Create personalized learning decks
- **Progress Tracking**: Comprehensive analytics and achievement system

### User Experience
- **Gamification**: XP points, achievement badges, and daily challenges
- **Dark/Light Theme**: Seamless theme switching with user preferences
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Welsh-Inspired Design**: Cultural aesthetics with modern UI/UX

### Technical Features
- **React + TypeScript**: Type-safe development with modern React patterns
- **Context API**: Centralized state management
- **Local Storage**: Persistent user data and progress
- **Tailwind CSS**: Utility-first styling with custom Welsh color palette
- **Recharts**: Beautiful data visualizations for progress tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flipcymru
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## 📱 Usage Guide

### Getting Started
1. **Create Account**: Register with email/password or use Google sign-in
2. **Complete Onboarding**: Take the skill assessment to determine your starting level
3. **Set Learning Goals**: Choose your daily XP target and study preferences

### Learning Features

#### Flashcards
- Browse cards by category (Greetings, Food, Family, etc.)
- Filter by difficulty level (Beginner, Intermediate, Advanced)
- Use spaced repetition for optimal learning
- Create custom flashcard decks
- Track accuracy and review statistics

#### Translation
- Translate between Welsh and English instantly
- Use voice input for pronunciation practice
- Save translations as flashcards
- Access translation history
- Quick translation shortcuts for common phrases

#### AI Conversations
- Choose from conversation topics:
  - Ordering Food
  - Asking Directions
  - Shopping
  - Casual Chat
  - Welsh Culture
  - Business Meetings
- Adaptive difficulty based on your responses
- Real-time grammar corrections
- Cultural context explanations

#### Progress Tracking
- View learning statistics and charts
- Monitor weekly XP progress
- Track category mastery
- Complete daily challenges
- Unlock achievement badges

### Gamification Elements
- **XP System**: Earn points for every learning activity
- **Streak Counter**: Maintain daily learning habits
- **Achievement Badges**: Unlock milestones like "First Steps" and "Streak Master"
- **Daily Challenges**: Complete specific tasks for bonus XP
- **Level Progression**: Advance through levels as you learn

## 🎨 Design System

### Color Palette
- **Welsh Green**: Primary brand color inspired by Welsh landscapes
- **Slate Blue**: Secondary color representing Welsh mountains
- **Warm Orange**: Accent color for highlights and achievements
- **Neutral Grays**: Supporting colors for text and backgrounds

### Typography
- Clean, modern fonts with full Welsh character support
- Proper rendering of diacritical marks (ŵ, ŷ, etc.)
- Responsive text scaling across devices

### Animations
- Smooth card flip animations for flashcards
- Progress bar animations for visual feedback
- Micro-interactions for enhanced user engagement
- Theme transition animations

## 🛠 Technical Architecture

### State Management
- **React Context**: Centralized app state with useReducer
- **Local Storage**: Persistent data storage
- **Type Safety**: Full TypeScript integration

### Component Structure
```
src/
├── components/          # Reusable UI components
├── context/            # App state management
├── data/               # Mock data and constants
├── pages/              # Main application views
└── App.tsx             # Root component
```

### Key Technologies
- **React 18**: Latest React features and hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **Lucide React**: Modern icon library
- **Vite**: Fast development and build tool

## 🌐 Future Enhancements

### Planned Features
- **Google Services Integration**:
  - Google Translate API for enhanced translations
  - Google Speech-to-Text for voice input
  - Google Text-to-Speech for pronunciation
  - Google Vision API for camera translation

- **AI Integration**:
  - Google Gemini API for advanced conversations
  - Personalized learning recommendations
  - Grammar correction and suggestions

- **Social Features**:
  - Friend connections and leaderboards
  - Community flashcard sharing
  - Group challenges and competitions

- **Advanced Learning**:
  - Welsh culture and history lessons
  - Pronunciation scoring
  - Writing practice exercises
  - Video content integration

### Technical Improvements
- **Backend Integration**: User accounts and cloud sync
- **Offline Support**: Progressive Web App features
- **Performance**: Code splitting and lazy loading
- **Accessibility**: Enhanced screen reader support
- **Testing**: Comprehensive test coverage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

For support, questions, or feedback, please open an issue on the GitHub repository.

---

**FlipCymru** - Making Welsh learning engaging, interactive, and fun! 🏴󠁧󠁢󠁷󠁬󠁳󠁿