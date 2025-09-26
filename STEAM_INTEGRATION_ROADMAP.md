# Steam Integration Roadmap for Chronotopia

This document outlines the comprehensive plan for publishing Chronotopia to Steam. This roadmap covers all technical, business, and marketing requirements needed to successfully launch the game on Steam.

## 📋 Executive Summary

**Chronotopia** is a strategy/resource management game built with React, TypeScript, and Phaser. Currently in early development, it features basic gameplay mechanics including turn-based resource management with different resource types (Crypto, Influence, Science, Happiness, Planets Capacity, Fleet Capacity).

**Current State**: The game has a working MVP with core gameplay loop, basic UI, and test coverage.

**Goal**: Full Steam release with proper desktop packaging, Steam SDK integration, and polished gameplay experience.

## 🎯 Phase 1: Technical Foundation (Priority: Critical)

### Desktop Application Packaging
- **Task**: Convert web-based React app to standalone desktop application
- **Options**: 
  - Electron (recommended for React compatibility)
  - Tauri (smaller bundle size, Rust-based)
- **Requirements**:
  - Native window management
  - File system access for save games
  - Auto-updater functionality
  - Proper app icons and metadata

### Steam SDK Integration
- **Task**: Integrate Steamworks SDK for core Steam features
- **Key Components**:
  - Steam authentication and DRM
  - Steam overlay support
  - Steam input API for controller support
  - Steam networking (if multiplayer is planned)
- **Files to modify**:
  - Add Steam SDK initialization to main application entry point
  - Create Steam service wrapper in `/src/services/steam/`
  - Update build process for Steam SDK libraries

### Save System Enhancement
- **Current State**: No persistent save system detected
- **Required**:
  - Local save/load functionality
  - Steam Cloud save integration
  - Save game versioning and migration
- **Implementation**: Create `/src/features/saves/` module

## 🎮 Phase 2: Game Content & Features (Priority: High)

### Core Gameplay Expansion
- **Tutorial System**: Interactive onboarding for new players
- **Game Modes**: Expand beyond current "Demo" type
  - Campaign mode with story progression
  - Skirmish mode with different difficulty levels
  - Endless mode for experienced players
- **Win/Lose Conditions**: Clear objectives and game endings
- **Balancing**: Resource generation rates and thresholds

### User Interface Polish
- **Settings Menu**: Graphics, audio, input configuration
- **Pause/Resume**: Proper game state management
- **Responsive Design**: Adapt UI for different screen resolutions
- **Accessibility**: Keyboard navigation, screen reader support

### Audio Implementation
- **Background Music**: Atmospheric tracks for different game phases
- **Sound Effects**: Resource collection, turn advancement, UI interactions
- **Audio Options**: Volume controls, mute functionality

## 🏆 Phase 3: Steam-Specific Features (Priority: Medium)

### Steam Achievements
- **Implementation Strategy**: Create achievement system in `/src/features/achievements/`
- **Suggested Achievements**:
  - "First Steps": Complete tutorial
  - "Resource Master": Reach maximum capacity in all resources
  - "Strategist": Win a game in under 50 turns
  - "Explorer": Discover all planet types
  - "Admiral": Build maximum fleet capacity
- **Technical**: Steam achievement API integration

### Steam Rich Presence
- **Show Game Status**: Current turn, game mode, resources
- **Implementation**: Update Steam presence on game state changes
- **File**: `/src/services/steam/RichPresence.ts`

### Steam Input Support
- **Controller Compatibility**: Full Steam Controller and gamepad support
- **Steam Deck Optimization**: Proper scaling and input handling
- **Implementation**: Input abstraction layer in `/src/features/input/`

### Optional Features
- **Steam Trading Cards**: Collectible cards featuring game art
- **Steam Workshop**: User-generated content support (if applicable)
- **Steam Leaderboards**: High scores and statistics

## 🏪 Phase 4: Steam Store Setup (Priority: High)

### Store Page Assets
- **Capsule Images**: 
  - Main capsule (616x353px)
  - Small capsule (231x87px)
  - Header capsule (460x215px)
- **Screenshots**: Minimum 5 high-quality gameplay screenshots
- **Trailer**: 30-60 second gameplay trailer
- **Logo**: Transparent background game logo

### Store Content
- **Description**: Compelling game description highlighting key features
- **System Requirements**: Minimum and recommended PC specs
- **Pricing Strategy**: Research similar games and set competitive price
- **Release Date**: Realistic timeline based on development progress

### Age Rating & Classification
- **ESRB Rating**: Likely E for Everyone based on current content
- **International Ratings**: PEGI, USK, CERO as needed
- **Content Descriptors**: Mild fantasy violence (if applicable)

## 🔧 Phase 5: Quality Assurance (Priority: Critical)

### Testing Requirements
- **Platform Testing**: Windows 10/11, Steam Deck, various hardware configurations
- **Performance Testing**: Memory usage, FPS stability, loading times
- **Integration Testing**: Steam features, save/load, achievements
- **User Testing**: Beta testing with Steam Playtest

### Bug Tracking & Resolution
- **Issue Tracking**: Implement comprehensive bug reporting system
- **Crash Reporting**: Automatic crash dumps and error reporting
- **Performance Monitoring**: FPS tracking, memory leak detection

## 📈 Phase 6: Launch Preparation (Priority: Medium)

### Marketing Materials
- **Press Kit**: Game description, screenshots, developer bio
- **Social Media**: Twitter, Discord community setup
- **Game Website**: Landing page with game information

### Release Strategy
- **Soft Launch**: Internal testing and Steam Playtest
- **Pre-release**: Steam wishlist campaign
- **Launch**: Full Steam release with marketing push

## 💰 Business Requirements

### Steam Partnership
- **Steam Direct Fee**: $100 per game
- **Revenue Share**: Steam takes 30% (reducing to 25% after $10M, 20% after $50M)
- **Payment Processing**: Steam handles all payment processing

### Legal Requirements
- **Business Registration**: Proper business entity for tax purposes
- **Tax Information**: W-9 or W-8 form for Steam payments
- **Privacy Policy**: GDPR compliant privacy policy
- **Terms of Service**: Clear terms for players

## 📅 Estimated Timeline

### Phase 1 (Technical Foundation): 2-3 months
- Week 1-2: Choose and implement desktop packaging solution
- Week 3-6: Steam SDK integration and basic testing
- Week 7-12: Save system and core infrastructure

### Phase 2 (Game Content): 3-4 months
- Month 1: Tutorial system and expanded gameplay
- Month 2: UI polish and settings implementation
- Month 3: Audio implementation and content creation
- Month 4: Testing and balancing

### Phase 3 (Steam Features): 1-2 months
- Month 1: Achievements, Rich Presence, Input support
- Month 2: Optional features and Steam Deck optimization

### Phase 4 (Store Setup): 2-4 weeks
- Week 1-2: Asset creation and store page setup
- Week 3-4: Store content writing and submission

### Phase 5 (QA): 1-2 months (parallel with other phases)
- Ongoing testing throughout development
- Final month: Intensive testing and bug fixing

### Phase 6 (Launch): 2-4 weeks
- Marketing preparation and community building
- Launch week activities

**Total Estimated Timeline: 8-12 months**

## 🛠️ Technical Implementation Notes

### Key Files to Create/Modify:
```
/src/services/steam/
  ├── SteamAPI.ts
  ├── Achievements.ts
  ├── RichPresence.ts
  └── CloudSave.ts

/src/features/saves/
  ├── SaveManager.ts
  ├── SaveData.ts
  └── SaveMigration.ts

/src/features/achievements/
  ├── AchievementManager.ts
  ├── AchievementDefinitions.ts
  └── AchievementUI.tsx

/electron/ (or /tauri/)
  ├── main.js
  ├── preload.js
  └── steam_appid.txt
```

### Build System Updates:
- Update `package.json` with desktop build scripts
- Add Steam SDK to build dependencies
- Configure auto-updater system
- Set up proper code signing for distribution

## 📝 Next Steps

1. **Immediate**: Choose desktop packaging solution (Electron vs Tauri)
2. **Priority**: Set up Steam Developer account and create App ID
3. **Development**: Begin Phase 1 technical implementation
4. **Planning**: Create detailed project timeline with milestones

## 🔗 Resources

- [Steamworks SDK Documentation](https://partner.steamgames.com/doc/sdk)
- [Steam Store Asset Guidelines](https://partner.steamgames.com/doc/store/assets)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Tauri Documentation](https://tauri.app/v1/guides/)

---

*This roadmap should be used as the basis for creating a GitHub issue to track Steam integration progress. Each phase can be broken down into individual issues for better project management.*