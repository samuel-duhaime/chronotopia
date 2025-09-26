# Steam Integration Technical Implementation Guide

This guide provides specific technical steps and code examples for implementing Steam integration in Chronotopia.

## 1. Desktop Application Packaging

### Option A: Electron (Recommended)
Electron provides excellent React integration and mature Steam SDK support.

**Installation:**
```bash
npm install --save-dev electron electron-builder
npm install --save electron-store
```

**File Structure:**
```
electron/
├── main.js          # Main Electron process
├── preload.js       # Preload scripts for renderer
└── steam_appid.txt  # Your Steam App ID
```

**Basic main.js:**
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Steam SDK initialization
if (!isDev) {
  const steamworks = require('steamworks.js');
  steamworks.init(your_app_id);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
```

### Option B: Tauri (Lighter Alternative)
Smaller bundle size but requires Rust knowledge for Steam SDK integration.

**Installation:**
```bash
npm install --save-dev @tauri-apps/cli
```

## 2. Steam SDK Integration

### Install Steamworks SDK
```bash
npm install steamworks.js
```

### Create Steam Service Layer
**File: `/src/services/steam/SteamAPI.ts`**
```typescript
export interface SteamAPI {
  isInitialized(): boolean;
  getCurrentUser(): SteamUser | null;
  unlockAchievement(achievementId: string): void;
  saveToCloud(key: string, data: string): Promise<boolean>;
  loadFromCloud(key: string): Promise<string | null>;
  showOverlay(dialog: 'friends' | 'community' | 'players' | 'settings'): void;
}

class SteamAPIImpl implements SteamAPI {
  private steamworks: any;

  constructor() {
    if (window.electron?.steamworks) {
      this.steamworks = window.electron.steamworks;
    }
  }

  isInitialized(): boolean {
    return !!this.steamworks;
  }

  getCurrentUser(): SteamUser | null {
    if (!this.steamworks) return null;
    return this.steamworks.localplayer;
  }

  unlockAchievement(achievementId: string): void {
    if (!this.steamworks) return;
    this.steamworks.achievement.activate(achievementId);
  }

  async saveToCloud(key: string, data: string): Promise<boolean> {
    if (!this.steamworks) return false;
    return this.steamworks.cloud.writeFile(key, data);
  }

  async loadFromCloud(key: string): Promise<string | null> {
    if (!this.steamworks) return null;
    return this.steamworks.cloud.readFile(key);
  }

  showOverlay(dialog: string): void {
    if (!this.steamworks) return;
    this.steamworks.overlay.activate(dialog);
  }
}

export const steamAPI = new SteamAPIImpl();
```

## 3. Save System with Steam Cloud

**File: `/src/features/saves/SaveManager.ts`**
```typescript
import { steamAPI } from '../services/steam/SteamAPI';
import type { GameSceneProps } from '../game/GameScene';

export interface SaveData {
  version: number;
  timestamp: number;
  gameState: GameSceneProps;
}

export class SaveManager {
  private readonly SAVE_KEY = 'chronotopia_save';
  private readonly CURRENT_VERSION = 1;

  async saveGame(gameState: GameSceneProps): Promise<boolean> {
    const saveData: SaveData = {
      version: this.CURRENT_VERSION,
      timestamp: Date.now(),
      gameState
    };

    const serialized = JSON.stringify(saveData);

    // Try Steam Cloud first, fallback to local storage
    if (steamAPI.isInitialized()) {
      const success = await steamAPI.saveToCloud(this.SAVE_KEY, serialized);
      if (success) return true;
    }

    // Fallback to local storage
    localStorage.setItem(this.SAVE_KEY, serialized);
    return true;
  }

  async loadGame(): Promise<GameSceneProps | null> {
    let serialized: string | null = null;

    // Try Steam Cloud first
    if (steamAPI.isInitialized()) {
      serialized = await steamAPI.loadFromCloud(this.SAVE_KEY);
    }

    // Fallback to local storage
    if (!serialized) {
      serialized = localStorage.getItem(this.SAVE_KEY);
    }

    if (!serialized) return null;

    try {
      const saveData: SaveData = JSON.parse(serialized);
      
      // Handle version migration if needed
      if (saveData.version < this.CURRENT_VERSION) {
        return this.migrateSave(saveData);
      }

      return saveData.gameState;
    } catch (error) {
      console.error('Failed to load save:', error);
      return null;
    }
  }

  private migrateSave(saveData: SaveData): GameSceneProps {
    // Handle save data migration between versions
    return saveData.gameState;
  }
}

export const saveManager = new SaveManager();
```

## 4. Steam Achievements

**File: `/src/features/achievements/AchievementDefinitions.ts`**
```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_STEPS',
    name: 'First Steps',
    description: 'Complete the tutorial'
  },
  {
    id: 'RESOURCE_MASTER',
    name: 'Resource Master',
    description: 'Reach maximum capacity in all resources'
  },
  {
    id: 'SPEED_RUNNER',
    name: 'Strategic Genius',
    description: 'Win a game in under 25 turns'
  },
  {
    id: 'EXPLORER',
    name: 'Space Explorer',
    description: 'Maximize your planets capacity'
  },
  {
    id: 'ADMIRAL',
    name: 'Fleet Admiral',
    description: 'Maximize your fleet capacity'
  }
];
```

**File: `/src/features/achievements/AchievementManager.ts`**
```typescript
import { steamAPI } from '../../services/steam/SteamAPI';
import { ACHIEVEMENTS } from './AchievementDefinitions';
import type { Resource, GameSceneProps } from '../game/GameScene';

export class AchievementManager {
  private unlockedAchievements = new Set<string>();

  checkAchievements(gameState: GameSceneProps): void {
    // First Steps - Complete tutorial
    if (gameState.turn > 1 && !this.unlockedAchievements.has('FIRST_STEPS')) {
      this.unlockAchievement('FIRST_STEPS');
    }

    // Resource Master - All resources at max
    if (this.areAllResourcesAtMax(gameState.resources)) {
      this.unlockAchievement('RESOURCE_MASTER');
    }

    // Explorer - Max planets capacity
    const planetsCapacity = gameState.resources.find(r => r.type === 'PlanetsCapacity');
    if (planetsCapacity && 'maxCapacity' in planetsCapacity && 
        planetsCapacity.amount >= planetsCapacity.maxCapacity) {
      this.unlockAchievement('EXPLORER');
    }

    // Admiral - Max fleet capacity
    const fleetCapacity = gameState.resources.find(r => r.type === 'FleetCapacity');
    if (fleetCapacity && 'maxCapacity' in fleetCapacity && 
        fleetCapacity.amount >= fleetCapacity.maxCapacity) {
      this.unlockAchievement('ADMIRAL');
    }
  }

  private areAllResourcesAtMax(resources: Resource[]): boolean {
    return resources.every(resource => {
      if ('maxCapacity' in resource) {
        return resource.amount >= resource.maxCapacity;
      }
      if ('threshold' in resource) {
        return resource.amount >= resource.threshold;
      }
      return resource.amount >= 100; // Default max for resources without specific limits
    });
  }

  private unlockAchievement(achievementId: string): void {
    if (this.unlockedAchievements.has(achievementId)) return;

    this.unlockedAchievements.add(achievementId);
    steamAPI.unlockAchievement(achievementId);
    
    // Show notification to player
    this.showAchievementNotification(achievementId);
  }

  private showAchievementNotification(achievementId: string): void {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement) {
      // Could show a toast notification or modal
      console.log(`Achievement Unlocked: ${achievement.name}`);
    }
  }
}

export const achievementManager = new AchievementManager();
```

## 5. Integration with GameScene

Update the existing GameScene to integrate with Steam features:

**File: `/src/features/game/GameScene.ts` (additions)**
```typescript
import { saveManager } from '../saves/SaveManager';
import { achievementManager } from '../achievements/AchievementManager';

export class GameScene extends Phaser.Scene implements GameSceneProps {
  // ... existing code ...

  // Override the nextTurn method to include Steam integration
  nextTurn() {
    this.turn += 1;
    this.setTurn(this.turn);

    // Update resources per turn
    const resources = this.getResources();
    const updatedResources = resources.map(resource => {
      if ('perTurn' in resource) {
        return { ...resource, amount: resource.amount + resource.perTurn };
      }
      return resource;
    });
    this.setResources(updatedResources);

    // Check for achievements
    achievementManager.checkAchievements(this.getGame());

    // Auto-save every few turns
    if (this.turn % 5 === 0) {
      saveManager.saveGame(this.getGame());
    }

    this.registry.events.emit('changedata');
  }

  // Add method to manually save game
  async saveGame(): Promise<boolean> {
    return await saveManager.saveGame(this.getGame());
  }

  // Add method to load game
  async loadGame(): Promise<boolean> {
    const loadedState = await saveManager.loadGame();
    if (loadedState) {
      this.setGame(loadedState);
      return true;
    }
    return false;
  }
}
```

## 6. Build Configuration

**File: `package.json` (additions)**
```json
{
  "main": "dist-electron/main.js",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "build:electron": "npm run build && electron-builder",
    "dist": "npm run build:electron"
  },
  "build": {
    "appId": "com.chronotopia.game",
    "productName": "Chronotopia",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*"
    ],
    "extraFiles": [
      {
        "from": "steam_api.dll",
        "to": "."
      }
    ]
  }
}
```

## 7. Development Workflow

1. **Development**: Run `npm run electron:dev` for development with hot reload
2. **Testing**: Run `npm run build:electron` to test production build
3. **Distribution**: Run `npm run dist` to create installable packages

## Next Steps

1. Set up Electron with basic Steam SDK integration
2. Implement save/load functionality
3. Create achievement system
4. Test on multiple platforms
5. Submit to Steam for review

This technical guide provides the foundation for Steam integration. Each section can be implemented incrementally to build towards a full Steam release.