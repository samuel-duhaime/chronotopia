import Phaser from 'phaser';
import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';
import { faRocket, faBurst } from '@fortawesome/free-solid-svg-icons';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { useGameStore } from './gameStore';
import type { MapHex } from '../map/mapStore';

export class GameScene extends Phaser.Scene {
    board: BoardPlugin.Board | undefined;
    activeText: Phaser.GameObjects.Text | undefined;
    controls: Phaser.Cameras.Controls.SmoothedKeyControl | undefined;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    // This constructor initializes the game scene
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // console.log('Preloading assets...');
        this.load.image('fleet', 'assets/images/fleet.png');
        this.load.image('planetEarth', 'assets/images/planetEarth.png');
    }

    create() {
        // Initialize map data in the store
        useGameStore.getState().initializeMap();

        // Generate hexagonal map directly
        this.generateHexagonalMap();

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

    // Generates a hexagonal map
    generateHexagonalMap = () => {
        const rexBoard = this.rexBoard || (this.plugins.get('rexBoard') as BoardPlugin);
        const hexSize = 80;
        const board = rexBoard?.add?.board({
            grid: {
                gridType: 'hexagonGrid',
                x: 0,
                y: 0,
                size: hexSize,
                staggeraxis: 'y',
                staggerindex: 'odd'
            }
        });
        this.board = board;

        // Create tiles from hexes in store
        const hexes = useGameStore.getState().hexes;
        const tileList = hexes.map(({ x, y }) => ({ x, y }));

        // Draw visible hexagon shapes for each tile and set them interactive
        hexes.forEach((hex) => {
            // Get the world coordinates for this hex tile
            const worldXY = board?.tileXYToWorldXY(hex.x, hex.y);
            // Create a graphics object at the tile's position
            const graphics = this.add?.graphics({ x: worldXY.x, y: worldXY.y });
            // Draw the hex border using line style
            graphics?.lineStyle(2, 0xffffff, 1);
            // Get the points for the hexagon shape
            const points = board?.getGridPoints(hex.x, hex.y, true);
            // Draw the hexagon border, centering it at (0,0) relative to graphics
            graphics?.strokePoints(
                points.map((p) => ({ x: p.x - worldXY.x, y: p.y - worldXY.y })),
                true
            );
            // Set the graphics object as interactive using a polygon matching the hex shape
            graphics?.setInteractive(
                new Phaser.Geom.Polygon(points.map((p) => ({ x: p.x - worldXY.x, y: p.y - worldXY.y }))),
                Phaser.Geom.Polygon.Contains
            );
            // Listen for pointerdown events on this hex tile
            graphics?.on('pointerdown', () => {
                // Update active hex in store and redraw the map
                useGameStore.getState().setActiveHex({ x: hex.x, y: hex.y });
                this.drawHexMap();
            });
        });

        // Draws the hex map, highlighting the active tile
        this.drawHexMap();

        // Center camera on the middle of the map
        if (tileList?.length > 0) {
            const mid = Math.floor(tileList.length / 2);
            const center = board?.tileXYToWorldXY(tileList[mid].x, tileList[mid].y);
            this.cameras?.main?.centerOn(center.x, center.y);
        }
    };

    // Draws the hex map, highlighting the active tile
    drawHexMap = () => {
        // Draw tile content element inside the hex
        const drawTileContent = ({ hex }: { hex: MapHex }) => {
            const worldXY = this.board?.tileXYToWorldXY(hex.x, hex.y);
            if (!worldXY) return; // Safety check
            for (const el of hex.elements) {
                if (el.element === 'Planet') {
                    this.add?.image(worldXY.x, worldXY.y, 'planetEarth').setOrigin(0.5).setDisplaySize(50, 50);
                } else if (el.element === 'Fleet') {
                    this.add?.image(worldXY.x, worldXY.y, 'fleet').setOrigin(0.5).setDisplaySize(30, 30);
                } else {
                    this.add?.text(worldXY.x, worldXY.y, `${hex.x},${hex.y}`).setOrigin(0.5);
                }
            }
        };

        // Draw labels for elements
        const drawTileLabel = ({ hex }: { hex: MapHex }) => {
            const worldXY = this.board?.tileXYToWorldXY(hex.x, hex.y);
            if (!worldXY) return; // Safety check
            for (const el of hex.elements) {
                const labelY = worldXY.y - 55;
                if (el.element === 'Planet') {
                    const labelDiv = document.createElement('div');
                    labelDiv.innerText = 'Earth';
                    labelDiv.className = 'map-label';
                    const label = this.add?.dom(worldXY.x, labelY, labelDiv).setOrigin(0.5);
                    this.children.bringToTop(label);
                }
                if (el.element === 'Fleet') {
                    // Fleet label
                    const parentDiv = document.createElement('div');
                    parentDiv.className = 'map-label';

                    // Fleet icon and name
                    const fleetDiv = document.createElement('span');
                    fleetDiv.className = 'fleet-info';
                    const rocketSvg = icon(faRocket).node[0];
                    fleetDiv.appendChild(rocketSvg);

                    // Get the fleet-1 from the store
                    const fleet = useGameStore.getState().getFleetWithCommander({ fleetId: 'fleet-1' });

                    // Fleet name
                    const fleetName = document.createElement('span');
                    fleetName.innerText = fleet.commander.name;
                    fleetName.className = 'fleet-name';
                    fleetDiv.appendChild(fleetName);

                    // Burst icon and power
                    const burstDiv = document.createElement('span');
                    burstDiv.className = 'fleet-power';
                    const planetSvg = icon(faBurst).node[0];
                    burstDiv.appendChild(planetSvg);
                    const powerValue = document.createElement('span');
                    powerValue.innerText = fleet.commander.power.toString();
                    powerValue.className = 'power-value';
                    burstDiv.appendChild(powerValue);

                    // Append all to parent div
                    parentDiv.appendChild(fleetDiv);
                    parentDiv.appendChild(burstDiv);

                    // Add to Phaser DOM element
                    const label = this.add?.dom(worldXY.x, labelY, parentDiv).setOrigin(0.5);
                    this.children.bringToTop(label);
                }
            }
        };

        // Draw hex border
        const drawTileBorder = ({ hex, color }: { hex: MapHex; color: number }) => {
            const graphics = this.add?.graphics({
                lineStyle: {
                    width: 2,
                    color,
                    alpha: 1
                }
            });
            const points = this.board?.getGridPoints(hex.x, hex.y, true);
            if (points) {
                graphics?.strokePoints(points, true);
            }
        };

        // Get hexes and activeHex from store
        const { hexes, activeHex } = useGameStore.getState();

        // Draw all hex borders (active last for green border)
        for (const hex of hexes) {
            if (hex === activeHex) continue; // Skip active hex for now
            drawTileBorder({ hex, color: 0xffffff });
        }
        if (activeHex) {
            drawTileBorder({ hex: activeHex, color: 0x00ff00 });
        }

        // Draw all hex contents
        for (const hex of hexes) {
            drawTileContent({ hex });
        }

        // Draw all hex labels (always on top)
        for (const hex of hexes) {
            drawTileLabel({ hex });
        }

        // Draw active text at top left
        if (activeHex) {
            this.activeText?.destroy(); // Remove previous active text
            this.activeText = this.add
                ?.text(-80, -120, `Active: ${activeHex.x},${activeHex.y}`, {
                    fontSize: '20px',
                    color: '#00ff00',
                    fontStyle: 'bold'
                })
                .setOrigin(0, 0);
        }
    };
}

// Extend Phaser's Scene interface to include rexBoard
declare module 'phaser' {
    interface Scene {
        rexBoard: BoardPlugin;
    }
}
