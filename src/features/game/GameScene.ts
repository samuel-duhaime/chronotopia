import Phaser from 'phaser';
import { faBitcoin } from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faFlask, faSmile, faEarth, faRocket } from '@fortawesome/free-solid-svg-icons';
import { Map } from '../map/Map';
import { Fleet } from '../fleet/Fleet';

export type Player = {
    id: string;
    name: string;
    // ...other player properties
};
export type Action = {
    id: string;
    description: string;
    event: () => void;
    isActive: boolean;
};
export type CryptoResource = {
    type: 'Crypto';
    amount: number;
    perTurn: number;
    icon: typeof faBitcoin;
};
export type InfluenceResource = {
    type: 'Influence';
    amount: number;
    perTurn: number;
    icon: typeof faGlobe;
};
export type ScienceResource = {
    type: 'Science';
    amount: number;
    perTurn: number;
    threshold: number;
    icon: typeof faFlask;
};
export type HappinessResource = {
    type: 'Happiness';
    amount: number;
    perTurn: number;
    threshold: number;
    icon: typeof faSmile;
};
export type PlanetsCapacityResource = {
    type: 'PlanetsCapacity';
    amount: number;
    maxCapacity: number;
    icon: typeof faEarth;
};
export type FleetCapacityResource = {
    type: 'FleetCapacity';
    amount: number;
    maxCapacity: number;
    icon: typeof faRocket;
};
export type Resource =
    | CryptoResource
    | InfluenceResource
    | ScienceResource
    | HappinessResource
    | PlanetsCapacityResource
    | FleetCapacityResource;
export type GameTypeProps = 'Demo' | 'Normal' | 'Campaign' | 'Skirmish';
export type GameSceneProps = {
    id: string;
    name: string;
    type: GameTypeProps;
    turn: number;
    actions: Action[];
    map: Map | undefined;
    players?: Player[];
    fleets: Fleet[];
    resources: Resource[];
};

export class GameScene extends Phaser.Scene {
    id: string;
    name: string;
    type: GameTypeProps;
    turn: number;
    actions: Action[];
    map: Map | undefined;
    players: Player[];
    fleets: Fleet[];
    resources: Resource[];
    controls: Phaser.Cameras.Controls.SmoothedKeyControl | undefined;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    // This constructor initializes the game scene
    constructor() {
        // console.log('GameScene constructor');
        super({ key: 'GameScene' });
        this.id = '1';
        this.name = 'Demo Game';
        this.type = 'Demo';
        this.turn = 1;
        this.actions = [
            {
                id: '1',
                description: 'Command',
                event: () => this.setNextActionActive(),
                isActive: true
            },
            {
                id: '2',
                description: 'Next Turn',
                event: () => this.nextTurn(),
                isActive: false
            }
        ];
        this.map = undefined; // Will be initialized in create()
        this.players = [];
        this.fleets = [new Fleet()];
        this.resources = [
            { type: 'Crypto', amount: 0, perTurn: 1, icon: faBitcoin },
            { type: 'Influence', amount: 0, perTurn: 1, icon: faGlobe },
            { type: 'Science', amount: 0, perTurn: 1, threshold: 25, icon: faFlask },
            { type: 'Happiness', amount: 0, perTurn: 1, threshold: 100, icon: faSmile },
            { type: 'PlanetsCapacity', amount: 1, maxCapacity: 2, icon: faEarth },
            { type: 'FleetCapacity', amount: 1, maxCapacity: 2, icon: faRocket }
        ];
    }

    preload() {
        // console.log('Preloading assets...');
        this.load.image('fleet', 'assets/images/fleet.png');
        this.load.image('planetEarth', 'assets/images/planetEarth.png');
    }

    create() {
        this.map = new Map(this);
        this.map.generateHexagonalMap();

        // Initialize registry values
        this.registry.set('map', this.map);
        this.registry.set('id', this.id);
        this.registry.set('name', this.name);
        this.registry.set('type', this.type);
        this.registry.set('turn', this.turn);
        this.registry.set('actions', this.actions);
        this.registry.set('players', this.players);
        this.registry.set('fleets', this.fleets);
        this.registry.set('resources', this.resources);

        // Camera controls
        if (this.input?.keyboard) {
            this.cursors = this.input?.keyboard.createCursorKeys();
        }

        // Smooth camera control config
        const controlConfig = {
            camera: this.cameras?.main, // The camera to control
            left: this.cursors?.left, // Move camera left
            right: this.cursors?.right, // Move camera right
            up: this.cursors?.up, // Move camera up
            down: this.cursors?.down, // Move camera down
            acceleration: 2, // How quickly camera accelerates
            drag: 0.2, // How quickly camera slows down
            maxSpeed: 10 // Maximum camera speed
        };
        // Safety check for Phaser version compatibility
        if (Phaser.Cameras && Phaser.Cameras.Controls && Phaser.Cameras.Controls.SmoothedKeyControl) {
            this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
        }

        // Camera zoom with mouse wheel
        this.input?.on(
            'wheel',
            (
                _pointer: Phaser.Input.Pointer,
                _gameObjects: Phaser.GameObjects.GameObject[],
                _deltaX: number,
                deltaY: number
            ) => {
                if (deltaY > 0) {
                    // Scroll down: zoom out
                    this.cameras.main.setZoom(Math.max(0.5, this.cameras.main.zoom - 0.1));
                } else if (deltaY < 0) {
                    // Scroll up: zoom in
                    this.cameras.main.setZoom(Math.min(4, this.cameras.main.zoom + 0.1));
                }
            }
        );

        // Camera drag with mouse
        let dragStart: { x: number; y: number } | null = null;
        let cameraStart: { x: number; y: number } | null = null;
        this.input?.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.rightButtonDown() || pointer.leftButtonDown()) {
                dragStart = { x: pointer.x, y: pointer.y };
                cameraStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
            }
        });
        this.input?.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown && dragStart && cameraStart) {
                const dx = (dragStart.x - pointer.x) / this.cameras.main.zoom;
                const dy = (dragStart.y - pointer.y) / this.cameras.main.zoom;
                this.cameras.main.scrollX = cameraStart.x + dx;
                this.cameras.main.scrollY = cameraStart.y + dy;
            }
        });
        this.input?.on('pointerup', () => {
            dragStart = null;
            cameraStart = null;
        });
    }

    update(_time: number, delta: number) {
        if (this.controls) {
            this.controls.update(delta);
        }
    }

    /**
     * Returns all main game properties as an object for easy destructuring.
     * @returns {GameSceneProps}
     */
    getGame(): GameSceneProps {
        return {
            id: this.getId(),
            name: this.getName(),
            type: this.getType(),
            turn: this.getTurn(),
            actions: this.getActions(),
            map: this.map,
            players: this.getPlayers(),
            fleets: this.fleets,
            resources: this.getResources()
        };
    }

    /**
     * Sets all main game properties from a GameSceneProps object.
     */
    setGame(game: GameSceneProps) {
        this.setId(game.id);
        this.setName(game.name);
        this.setType(game.type);
        this.setTurn(game.turn);
        this.setResources(game.resources);
        this.registry.set('actions', game.actions);
        this.registry.set('players', game.players ?? []);
    }

    // Game ID
    getId() {
        return this.registry.get('id') as string;
    }
    setId(id: string) {
        this.registry.set('id', id);
    }

    // Game name
    getName() {
        return this.registry.get('name') as string;
    }
    setName(name: string) {
        this.registry.set('name', name);
    }

    // Game type
    getType() {
        return this.registry.get('type') as GameTypeProps;
    }
    setType(type: GameTypeProps) {
        this.registry.set('type', type);
    }

    // Game turn
    getTurn() {
        return this.registry.get('turn') as number;
    }
    setTurn(turn: number) {
        this.registry.set('turn', turn);
    }
    nextTurn() {
        this.updateResourcesNextTurn();
        this.setTurn(this.getTurn() + 1);
    }

    // Game actions
    getActions() {
        return this.registry.get('actions') as Action[];
    }
    getCurrentAction() {
        const actions = this.getActions();
        return Array.isArray(actions) && actions.length > 0 ? actions[0] : null;
    }
    addAction(action: Action) {
        const actions = this.registry.get('actions') as Action[];
        this.registry.set('actions', [...actions, action]);
    }
    setNextActionActive() {
        const actions = this.getActions();

        const currentAction = this.getCurrentAction();
        const currentIndex = actions.findIndex((action) => action.id === currentAction?.id);

        // If somehow not found, just activate the first action
        if (currentIndex === -1) {
            actions.forEach((action, index) => (action.isActive = index === 0));
            this.registry.set('actions', actions);
            return;
        }

        // Deactivate current action
        actions[currentIndex].isActive = false;

        // Activate next action (loop to start if at end)
        const nextIndex = (currentIndex + 1) % actions.length;
        actions[nextIndex].isActive = true;

        // Update actions in registry
        this.registry.set('actions', actions);
    }

    // Game map
    getMap() {
        return this.registry.get('map') as Map;
    }
    setMap(map: Map) {
        this.registry.set('map', map);
    }

    // Game players
    getPlayers() {
        return this.registry.get('players') as Player[];
    }
    addPlayer(player: Player) {
        const players = this.registry.get('players') as Player[];
        this.registry.set('players', [...players, player]);
    }

    // Game fleets
    getFleets() {
        return this.registry.get('fleets') as Fleet[];
    }
    addFleet(fleet: Fleet) {
        const fleets = this.registry.get('fleets') as Fleet[];
        this.registry.set('fleets', [...fleets, fleet]);
    }

    // Game resources
    getResources() {
        return this.registry.get('resources') as Resource[];
    }
    setResources(resources: Resource[]) {
        this.registry.set('resources', resources);
    }
    /**
     * Updates all resources by their perTurn value at each next turn.
     * Handles threshold logic for applicable resources.
     */
    updateResourcesNextTurn() {
        // console.log('Updating resources for next turn');
        const resources = this.getResources().map((resource) => {
            if ('perTurn' in resource) {
                let newAmount = resource.amount + resource.perTurn;

                // Check if newAmount meets or exceeds the threshold
                if ('threshold' in resource && typeof resource.threshold === 'number') {
                    if (newAmount >= resource.threshold) {
                        // TODO: Trigger special event or bonus for reaching threshold
                        console.log(`Threshold reached for ${resource.type}: ${resource.threshold}`);
                        newAmount -= resource.threshold;
                    }
                }
                return {
                    ...resource,
                    amount: newAmount
                };
            }
            return resource;
        });
        this.setResources(resources);
    }
}
