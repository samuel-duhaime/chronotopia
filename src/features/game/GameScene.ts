import Phaser from 'phaser';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';
import { faBitcoin } from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faFlask, faSmile, faEarth, faRocket } from '@fortawesome/free-solid-svg-icons';

export type Player = {
    id: string;
    name: string;
    // ...other player properties
};
export type Action = {
    id: string;
    description: string;
    event: () => void;
    // ...other action properties
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
    players?: Player[];
    resources: Resource[];
};

export class GameScene extends Phaser.Scene implements GameSceneProps {
    rexBoard!: BoardPlugin;
    id: string;
    name: string;
    type: GameTypeProps;
    turn: number;
    actions: Action[];
    players: Player[];
    resources: Resource[];
    activeTile: { x: number; y: number } | null = null;

    // This constructor initializes the game scene
    constructor() {
        console.log('GameScene constructor');
        super({ key: 'GameScene' });
        this.id = '1';
        this.name = 'Demo Game';
        this.type = 'Demo';
        this.turn = 1;
        this.actions = [
            {
                id: '1',
                description: 'Next Turn',
                event: () => this.nextTurn()
            }
        ];
        this.players = [];
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
        console.log('Preloading assets...');
        this.load.image('fleet', 'assets/images/fleet.png');
        this.load.image('planetEarth', 'assets/images/planetEarth.png');
    }

    create() {
        this.registry.set('id', this.id);
        this.registry.set('name', this.name);
        this.registry.set('type', this.type);
        this.registry.set('turn', this.turn);
        this.registry.set('actions', this.actions);
        this.registry.set('players', this.players);
        this.registry.set('resources', this.resources);
        this.generateHexMap();
    }

    generateHexMap() {
        // Hexagon grid map
        const print = this.add.text(0, 0, 'Click any tile');
        const staggeraxis = 'y';
        const staggerindex = 'odd';
        const mapRadius = 4;
        const hexSize = 50;
        const board = this.rexBoard.add
            .board({
                grid: {
                    gridType: 'hexagonGrid',
                    x: 0,
                    y: 0,
                    size: hexSize,
                    staggeraxis,
                    staggerindex
                }
            })
            .setInteractive()
            .on('tiledown', (_pointer: Phaser.Input.Pointer, tileXY: { x: number; y: number }) => {
                print.text = `${tileXY.x},${tileXY.y}`;
                this.activeTile = { x: tileXY.x, y: tileXY.y };
                this.redrawHexMap(board, tileList, print);
            });
        const tileXYArray = board.fit(this.rexBoard.hexagonMap.hexagon(board, mapRadius));
        const tileList = Object.values(tileXYArray);
        this.redrawHexMap(board, tileList, print);
        const centerWorld = board.tileXYToWorldXY(4, 4);
        this.cameras.main.centerOn(centerWorld.x, centerWorld.y);
    }

    redrawHexMap(board: any, tileList: any[], print: Phaser.GameObjects.Text) {
        // Remove all previous graphics, text, and image objects
        this.children.list
            .filter((obj) => ['Graphics', 'Text', 'Image'].includes(obj.type))
            .forEach((obj) => obj.destroy());
        let activeTileXY: any = null;
        const drawTileContent = (tileXY: any) => {
            const worldXY = board.tileXYToWorldXY(tileXY.x, tileXY.y);
            if (tileXY.x === 4 && tileXY.y === 3) {
                this.add.image(worldXY.x, worldXY.y, 'planetEarth').setOrigin(0.5).setDisplaySize(50, 50);
            } else if (tileXY.x === 4 && tileXY.y === 4) {
                this.add.image(worldXY.x, worldXY.y, 'fleet').setOrigin(0.5).setDisplaySize(30, 30);
            } else {
                this.add.text(worldXY.x, worldXY.y, `${tileXY.x},${tileXY.y}`).setOrigin(0.5);
            }
        };
        const drawTileBorder = (tileXY: any, color: number) => {
            const graphics = this.add.graphics({
                lineStyle: {
                    width: 2,
                    color,
                    alpha: 1
                }
            });
            const points = board.getGridPoints(tileXY.x, tileXY.y, true);
            graphics.strokePoints(points, true);
        };
        for (const tileXY of tileList) {
            const isActive = this.activeTile && tileXY.x === this.activeTile.x && tileXY.y === this.activeTile.y;
            if (isActive) {
                activeTileXY = tileXY;
                continue; // Skip drawing active tile in loop
            }
            drawTileBorder(tileXY, 0xffffff);
            drawTileContent(tileXY);
        }
        // Draw active border and content last, only once
        if (activeTileXY) {
            drawTileBorder(activeTileXY, 0x00ff00);
            drawTileContent(activeTileXY);
            // Show active tile coordinates at top
            this.add.text(0, 0, `Active: ${activeTileXY.x},${activeTileXY.y}`, {
                fontSize: '20px',
                color: '#00ff00',
                fontStyle: 'bold'
            });
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
            players: this.getPlayers(),
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
        console.log('Getting current action');
        const actions = this.getActions();
        return Array.isArray(actions) && actions.length > 0 ? actions[0] : null;
    }
    addAction(action: Action) {
        const actions = this.registry.get('actions') as Action[];
        this.registry.set('actions', [...actions, action]);
    }

    // Game players
    getPlayers() {
        return this.registry.get('players') as Player[];
    }
    addPlayer(player: Player) {
        const players = this.registry.get('players') as Player[];
        this.registry.set('players', [...players, player]);
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
        console.log('Updating resources for next turn');
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
