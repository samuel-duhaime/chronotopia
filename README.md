# Chronotopia

A strategy/resource management game built with React, TypeScript, and Phaser.

## Game Overview

Chronotopia is a turn-based strategy game where players manage different types of resources (Crypto, Influence, Science, Happiness, Planets Capacity, Fleet Capacity) to achieve victory. The game features a space exploration theme with fleet and planet management mechanics.

## Current Status

The game is in early development with core gameplay mechanics implemented:
- ✅ Turn-based resource management system
- ✅ Multiple resource types with different properties
- ✅ Basic UI with resource display and action controls
- ✅ Unit tests for game logic
- ✅ Build pipeline and development tools

## Steam Integration Documentation

This repository contains comprehensive documentation for integrating Chronotopia with Steam:

- **[Steam Integration Roadmap](./STEAM_INTEGRATION_ROADMAP.md)** - Complete technical and business roadmap for Steam release
- **[GitHub Issue Template](./GITHUB_ISSUE_TEMPLATE.md)** - Ready-to-use GitHub issue template for tracking Steam integration
- **[Steam Checklist](./STEAM_CHECKLIST.md)** - Quick reference checklist organized by priority
- **[Technical Implementation Guide](./TECHNICAL_IMPLEMENTATION.md)** - Detailed code examples and implementation steps

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test:unit    # Run unit tests
npm run lint         # Run ESLint
```

### Game Controls
- Click "Next Turn" to advance the game and gain resources
- Watch your resources grow each turn based on their `perTurn` values
- Resources with thresholds (Science, Happiness) provide benefits when reached
- Capacity resources (Planets, Fleet) have maximum limits

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Phaser 3** - Game engine for rendering and game logic
- **Vite** - Build tool and development server
- **Jest** - Unit testing framework
- **FontAwesome** - Icons for resources and UI

## Architecture

The game follows a modular architecture:
- `/src/features/game/` - Core game logic and Phaser integration
- `/src/features/menu/` - UI components for resources and actions
- `/src/features/common/` - Shared components and utilities

## Vite Plugins

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
