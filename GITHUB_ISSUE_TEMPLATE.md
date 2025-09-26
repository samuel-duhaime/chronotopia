# GitHub Issue Template: MVP - Add Chronotopia Game to Steam

## Issue Description

This epic issue tracks all tasks required to publish Chronotopia to Steam. The game is currently a web-based React/Phaser application that needs to be packaged as a desktop application with full Steam integration.

## Current Game State
- ✅ Basic gameplay mechanics with resource management
- ✅ Turn-based strategy elements 
- ✅ React + TypeScript + Phaser tech stack
- ✅ Unit tests and build pipeline
- ❌ No desktop packaging
- ❌ No Steam SDK integration
- ❌ Limited game content (MVP/demo level)

## High-Level Goals
1. Package as standalone desktop application
2. Integrate Steam SDK for achievements, cloud saves, and platform features
3. Expand game content for full release
4. Set up Steam store presence
5. Launch successfully on Steam

## Phase 1: Technical Foundation (Critical Priority)
- [ ] **Desktop Packaging** - Convert web app to desktop using Electron or Tauri
  - [ ] Research and choose packaging solution
  - [ ] Set up build pipeline for desktop app
  - [ ] Implement auto-updater system
  - [ ] Add proper app icons and metadata
- [ ] **Steam SDK Integration** - Core Steamworks functionality
  - [ ] Set up Steam Developer account
  - [ ] Integrate Steamworks SDK
  - [ ] Add Steam authentication/DRM
  - [ ] Implement Steam overlay support
- [ ] **Save System** - Persistent game state with Steam Cloud
  - [ ] Create local save/load functionality  
  - [ ] Integrate Steam Cloud saves
  - [ ] Add save versioning and migration

## Phase 2: Game Content & Polish (High Priority)
- [ ] **Gameplay Expansion** - Move beyond MVP state
  - [ ] Add tutorial system for new players
  - [ ] Create multiple game modes (Campaign, Skirmish, Endless)
  - [ ] Implement proper win/lose conditions
  - [ ] Balance resource generation and thresholds
- [ ] **UI/UX Polish** - Desktop-optimized interface
  - [ ] Add settings menu (graphics, audio, controls)
  - [ ] Implement pause/resume functionality
  - [ ] Optimize for different screen resolutions
  - [ ] Add accessibility features
- [ ] **Audio Implementation** - Enhance player experience
  - [ ] Add background music
  - [ ] Implement sound effects for actions
  - [ ] Create audio settings and controls

## Phase 3: Steam Platform Features (Medium Priority)
- [ ] **Steam Achievements** - Player engagement system
  - [ ] Design achievement list
  - [ ] Implement achievement tracking
  - [ ] Integrate with Steam achievement API
- [ ] **Steam Input & Compatibility** - Broad device support
  - [ ] Add full controller support
  - [ ] Optimize for Steam Deck
  - [ ] Implement Steam Input API
- [ ] **Steam Social Features** - Community integration
  - [ ] Add Steam Rich Presence
  - [ ] Implement Steam Friends integration
  - [ ] Add screenshot functionality

## Phase 4: Steam Store Setup (High Priority)
- [ ] **Store Assets** - Visual marketing materials
  - [ ] Create capsule images (multiple sizes)
  - [ ] Take high-quality screenshots
  - [ ] Produce gameplay trailer
- [ ] **Store Content** - Marketing and information
  - [ ] Write compelling game description
  - [ ] Set system requirements
  - [ ] Research and set pricing
  - [ ] Handle age rating requirements
- [ ] **Store Configuration** - Technical setup
  - [ ] Configure Steam App ID
  - [ ] Set up regional pricing
  - [ ] Add game categories and tags

## Phase 5: Quality Assurance (Critical Priority)
- [ ] **Testing** - Ensure quality release
  - [ ] Test on multiple PC configurations
  - [ ] Verify Steam Deck compatibility
  - [ ] Conduct Steam Playtest beta
  - [ ] Performance optimization testing
- [ ] **Bug Resolution** - Polish for release
  - [ ] Set up crash reporting system
  - [ ] Fix identified bugs and issues
  - [ ] Memory leak testing
  - [ ] Load time optimization

## Phase 6: Launch Preparation (Medium Priority)
- [ ] **Marketing Materials** - Build audience
  - [ ] Create press kit
  - [ ] Set up social media presence
  - [ ] Build game website/landing page
- [ ] **Release Strategy** - Coordinated launch
  - [ ] Plan soft launch timeline
  - [ ] Set up wishlist campaign
  - [ ] Prepare launch day activities

## Business Requirements
- [ ] Complete Steam Direct submission ($100 fee)
- [ ] Set up tax and banking information
- [ ] Create privacy policy and terms of service
- [ ] Obtain necessary business licenses

## Success Criteria
- [ ] Game successfully launches on Steam
- [ ] All Steam platform features work correctly
- [ ] Positive player reception and reviews
- [ ] No critical bugs or crashes
- [ ] Steam Deck verification achieved

## Estimated Timeline: 8-12 months

## Dependencies
- Steam Developer account approval
- Art assets for store page
- Music and sound effect production
- Beta testing community

## Resources Needed
- Development team familiar with Steam SDK
- Graphic designer for store assets
- Audio designer for music/SFX
- QA testers with various hardware configurations

---

**Labels**: `epic`, `enhancement`, `steam-integration`, `high-priority`
**Milestone**: Steam Release v1.0
**Assignee**: Development Team Lead