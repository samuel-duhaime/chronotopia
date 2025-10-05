import BoardPlugin from 'phaser3-rex-plugins/plugins/board-plugin';
import { faRocket, faBurst } from '@fortawesome/free-solid-svg-icons';
import { icon } from '@fortawesome/fontawesome-svg-core';
import { GameScene } from '../game/GameScene';

// TODO: Future: Asteroid, Wormhole, Star, BlackHole, Nebula, Debris, Building, Unit, Resource, Research, Item, Event, Shipyard, Starbase, Colony, TradeRoute, Anomaly, Artifact, Outpost, Mine
export type Element = 'Empty' | 'Planet' | 'Fleet';
export type MapHex = {
    x: number;
    y: number;
    elements: { element: Element; id: string }[];
    isActive?: boolean;
};
export type MainCamera = Phaser.Cameras.Scene2D.Camera;
export class Map {
    hexes: MapHex[];
    scene: GameScene;
    rexBoard?: BoardPlugin;
    add: Phaser.GameObjects.GameObjectFactory;
    activeText: Phaser.GameObjects.Text;
    cameras?: MainCamera;
    board: BoardPlugin.Board | undefined;
    activeHex: MapHex | null = null;

    constructor(scene: GameScene) {
        this.scene = scene;
        this.hexes = [];
        this.add = scene.add;
        this.activeText = scene.add?.text(0, 0, ''); // Initialize with empty text

        // Simple demo map with some predefined elements
        for (let x = 0; x <= 10; x++) {
            for (let y = 0; y <= 10; y++) {
                let elements: { element: Element; id: string }[] = [{ element: 'Empty', id: `empty-${x}-${y}` }];
                let isActive = false;
                if (x === 5 && y === 4) {
                    elements = [{ element: 'Planet', id: 'planet-earth' }];
                }
                if (x === 5 && y === 5) {
                    elements = [{ element: 'Fleet', id: 'fleet-1' }];
                    isActive = true;
                }
                this.hexes.push({ x, y, elements, isActive });
            }
        }
        // Set initial activeHex
        this.activeHex = this.hexes.find((hex) => hex.isActive) ?? null;
    }

    // Generates a hexagonal map
    generateHexagonalMap() {
        this.rexBoard = this.scene.rexBoard;
        this.cameras = this.scene.cameras?.main;
        const hexSize = 80;
        const board = this.rexBoard?.add?.board({
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

        // Create tiles from this.hexes
        const tileList = this.hexes.map((hex) => ({ x: hex.x, y: hex.y }));

        // Draw visible hexagon shapes for each tile and set them interactive
        this.hexes.forEach((hex) => {
            // Get the world coordinates for this hex tile
            const worldXY = board?.tileXYToWorldXY(hex.x, hex.y);
            // Create a graphics object at the tile's position
            const graphics = this.scene.add?.graphics({ x: worldXY.x, y: worldXY.y });
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
                // Update active state for all hexes
                this.hexes.forEach((h) => {
                    h.isActive = h.x === hex.x && h.y === hex.y;
                });
                // Set the active hex and redraw the map
                this.activeHex = this.hexes.find((h) => h.x === hex.x && h.y === hex.y) ?? null;
                this.drawHexMap();
            });
        });

        // Draws the hex map, highlighting the active tile
        this.drawHexMap();

        // Center camera on the middle of the map
        if (tileList?.length > 0) {
            const mid = Math.floor(tileList.length / 2);
            const center = board?.tileXYToWorldXY(tileList[mid].x, tileList[mid].y);
            this.cameras?.centerOn(center.x, center.y);
        }
    }

    // Draws the hex map, highlighting the active tile
    drawHexMap() {
        // Draw tile content element inside the hex
        const drawTileContent = (hex: MapHex) => {
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
        const drawTileLabel = (hex: MapHex) => {
            const worldXY = this.board?.tileXYToWorldXY(hex.x, hex.y);
            if (!worldXY) return; // Safety check
            for (const el of hex.elements) {
                const labelY = worldXY.y - 55;
                if (el.element === 'Planet') {
                    const labelDiv = document.createElement('div');
                    labelDiv.innerText = 'Earth';
                    labelDiv.className = 'map-label';
                    const label = this.add?.dom(worldXY.x, labelY, labelDiv).setOrigin(0.5);
                    this.scene.children.bringToTop(label);
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

                    // Get fleet name and power from scene's fleets
                    let fleetNameText = 'Fleet';
                    let fleetPowerValue = '1';
                    // FIXME: This fleets doesn't work on the first render for some reason
                    const fleets = this.scene.getFleets();
                    if (fleets && fleets.length > 0 && fleets[0].commander) {
                        if (fleets[0].commander.name) {
                            fleetNameText = fleets[0].commander.name;
                        }
                        if (typeof fleets[0].commander.power === 'number') {
                            fleetPowerValue = fleets[0].commander.power.toString();
                        }
                    }

                    // Fleet name
                    const fleetName = document.createElement('span');
                    fleetName.innerText = fleetNameText;
                    fleetName.className = 'fleet-name';
                    fleetDiv.appendChild(fleetName);

                    // Burst icon and power
                    const burstDiv = document.createElement('span');
                    burstDiv.className = 'fleet-power';
                    const planetSvg = icon(faBurst).node[0];
                    burstDiv.appendChild(planetSvg);
                    const powerValue = document.createElement('span');
                    powerValue.innerText = fleetPowerValue;
                    powerValue.className = 'power-value';
                    burstDiv.appendChild(powerValue);

                    // Append all to parent div
                    parentDiv.appendChild(fleetDiv);
                    parentDiv.appendChild(burstDiv);

                    // Add to Phaser DOM element
                    const label = this.add?.dom(worldXY.x, labelY, parentDiv).setOrigin(0.5);
                    this.scene.children.bringToTop(label);
                }
                // You can add more labels for other elements here if needed
            }
        };
        // Draw hex border
        const drawTileBorder = (hex: MapHex, color: number) => {
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
        // Draw all hex borders (active last for green border)
        for (const hex of this.hexes) {
            if (hex === this.activeHex) continue; // Skip active hex for now
            drawTileBorder(hex, 0xffffff);
        }
        if (this.activeHex) {
            drawTileBorder(this.activeHex, 0x00ff00);
        }

        // Draw all hex contents
        for (const hex of this.hexes) {
            drawTileContent(hex);
        }

        // Draw all hex labels (always on top)
        for (const hex of this.hexes) {
            drawTileLabel(hex);
        }

        // Draw active text at top left
        if (this.activeHex) {
            this.activeText?.destroy(); // Remove previous active text
            this.activeText = this.add
                ?.text(-80, -120, `Active: ${this.activeHex.x},${this.activeHex.y}`, {
                    fontSize: '20px',
                    color: '#00ff00',
                    fontStyle: 'bold'
                })
                .setOrigin(0, 0);
        }
    }
}

// Extend Phaser's Scene interface to include rexBoard
declare module 'phaser' {
    interface Scene {
        rexBoard: BoardPlugin;
    }
}
