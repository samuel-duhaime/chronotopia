// import { GameScene, type GameSceneProps, type Player, type Action, type Resource } from './GameScene';
// import { Fleet } from '../fleet/Fleet';
// import { Map } from '../map/Map';

// // Mock Phaser to avoid jsdom/canvas errors
// jest.mock('phaser', () => ({
//     Scene: class {}
// }));

// describe('GameScene Unit Tests', () => {
//     beforeEach(() => {
//         const store: Record<string, unknown> = {};
//         (GameScene.prototype as Phaser.Scene).registry = {
//             set: (key: string, value: unknown) => {
//                 store[key] = value;
//                 return (GameScene.prototype as Phaser.Scene).registry;
//             },
//             get: (key: string) => {
//                 return store[key];
//             }
//         } as unknown as Phaser.Data.DataManager;
//     });

//     it('should initialize with default values', () => {
//         const scene = new GameScene();
//         expect(scene.id).toBe('1');
//         expect(scene.name).toBe('Demo Game');
//         expect(scene.type).toBe('Demo');
//         expect(scene.turn).toBe(1);
//         expect(scene.actions.length).toBe(1);
//         expect(scene.players.length).toBe(0);
//     });

//     it('should get all game properties with getGame', () => {
//         const scene = new GameScene();
//         scene.create();
//         const game = scene.getGame();
//         expect(game.id).toBe(scene.getId());
//         expect(game.name).toBe(scene.getName());
//         expect(game.type).toBe(scene.getType());
//         expect(game.turn).toBe(scene.getTurn());
//         expect(game.actions).toEqual(scene.getActions());
//         expect(game.players).toEqual(scene.getPlayers());
//         expect(game.resources).toEqual(scene.getResources());
//     });

//     it('should set all game properties with setGame', () => {
//         const scene = new GameScene();
//         scene.create();
//         const newGame: GameSceneProps = {
//             id: '99',
//             name: 'Set Game Test',
//             type: 'Skirmish' as GameScene['type'],
//             turn: 5,
//             actions: [{ id: 'a1', description: 'Action', event: () => {} }],
//             map: new Map(scene),
//             players: [{ id: 'p2', name: 'Bob' }],
//             fleets: [new Fleet()],
//             resources: [
//                 {
//                     type: 'Crypto',
//                     amount: 100,
//                     perTurn: 10,
//                     icon: scene.resources[0].icon
//                 },
//                 {
//                     type: 'Influence',
//                     amount: 50,
//                     perTurn: 5,
//                     icon: scene.resources[1].icon
//                 },
//                 {
//                     type: 'Science',
//                     amount: 20,
//                     perTurn: 2,
//                     threshold: 10,
//                     icon: scene.resources[2].icon
//                 },
//                 {
//                     type: 'Happiness',
//                     amount: 30,
//                     perTurn: 3,
//                     threshold: 15,
//                     icon: scene.resources[3].icon
//                 },
//                 {
//                     type: 'PlanetsCapacity',
//                     amount: 2,
//                     maxCapacity: 4,
//                     icon: scene.resources[4].icon
//                 },
//                 {
//                     type: 'FleetCapacity',
//                     amount: 3,
//                     maxCapacity: 6,
//                     icon: scene.resources[5].icon
//                 }
//             ]
//         };
//         scene.setGame(newGame);
//         expect(scene.getId()).toBe('99');
//         expect(scene.getName()).toBe('Set Game Test');
//         expect(scene.getType()).toBe('Skirmish');
//         expect(scene.getTurn()).toBe(5);
//         expect(scene.getActions()).toEqual(newGame.actions);
//         expect(scene.getMap()).toEqual(newGame.map);
//         expect(scene.getPlayers()).toEqual(newGame.players);
//         expect(scene.getFleets()).toEqual(newGame.fleets);
//         expect(scene.getResources()).toEqual(newGame.resources);
//     });

//     it('should set and get id', () => {
//         const scene = new GameScene();
//         scene.setId('42');
//         expect(scene.getId()).toBe('42');
//     });

//     it('should get and set name', () => {
//         const scene = new GameScene();
//         scene.setName('Test Game');
//         expect(scene.getName()).toBe('Test Game');
//     });

//     it('should add player', () => {
//         const scene = new GameScene();
//         scene.create();
//         const player: Player = { id: 'p1', name: 'Alice' };
//         scene.addPlayer(player);
//         expect(scene.getPlayers().length).toBe(1);
//         expect(scene.getPlayers()[0].name).toBe('Alice');
//     });

//     it('should advance turn', () => {
//         const scene = new GameScene();
//         scene.create();
//         expect(scene.getTurn()).toBe(1);
//         scene.nextTurn();
//         expect(scene.getTurn()).toBe(2);
//     });

//     it('should add action', () => {
//         const scene = new GameScene();
//         scene.create();
//         const action: Action = { id: '2', description: 'Test', event: () => {} };
//         scene.addAction(action);
//         expect(scene.getActions().length).toBe(2);
//         expect(scene.getActions()[1].description).toBe('Test');
//     });

//     it('should initialize resources with correct types and icons', () => {
//         const scene = new GameScene();
//         const resources = scene.resources;
//         expect(resources.length).toBe(6);
//         expect(resources[0].type).toBe('Crypto');
//         expect(resources[0]).toHaveProperty('icon');
//         expect(resources[1].type).toBe('Influence');
//         expect(resources[1]).toHaveProperty('icon');
//         expect(resources[2].type).toBe('Science');
//         expect(resources[2]).toHaveProperty('threshold');
//         expect(resources[2]).toHaveProperty('icon');
//         expect(resources[3].type).toBe('Happiness');
//         expect(resources[3]).toHaveProperty('threshold');
//         expect(resources[3]).toHaveProperty('icon');
//         expect(resources[4].type).toBe('PlanetsCapacity');
//         expect(resources[4]).toHaveProperty('maxCapacity');
//         expect(resources[4]).toHaveProperty('icon');
//         expect(resources[5].type).toBe('FleetCapacity');
//         expect(resources[5]).toHaveProperty('maxCapacity');
//         expect(resources[5]).toHaveProperty('icon');
//     });

//     it('should get and set resources', () => {
//         const scene = new GameScene();
//         scene.create();
//         // Use correct resource type and required properties
//         const newResources: Resource[] = [
//             {
//                 type: 'Crypto',
//                 amount: 10,
//                 perTurn: 2,
//                 icon: scene.resources[0].icon
//             },
//             {
//                 type: 'Science',
//                 amount: 5,
//                 perTurn: 1,
//                 threshold: 50,
//                 icon: scene.resources[2].icon
//             },
//             {
//                 type: 'Happiness',
//                 amount: 7,
//                 perTurn: 1,
//                 threshold: 20,
//                 icon: scene.resources[3].icon
//             },
//             {
//                 type: 'PlanetsCapacity',
//                 amount: 2,
//                 maxCapacity: 5,
//                 icon: scene.resources[4].icon
//             },
//             {
//                 type: 'FleetCapacity',
//                 amount: 3,
//                 maxCapacity: 6,
//                 icon: scene.resources[5].icon
//             },
//             {
//                 type: 'Influence',
//                 amount: 8,
//                 perTurn: 2,
//                 icon: scene.resources[1].icon
//             }
//         ];
//         scene.setResources(newResources);
//         expect(scene.getResources().length).toBe(6);
//         // Type guards for property checks
//         const crypto = scene.getResources()[0];
//         if (crypto.type === 'Crypto') {
//             expect(crypto.amount).toBe(10);
//             expect(crypto.perTurn).toBe(2);
//             expect(crypto.icon).toBe(scene.resources[0].icon);
//         }
//         const science = scene.getResources()[1];
//         if (science.type === 'Science') {
//             expect(science.threshold).toBe(50);
//         }
//         const happiness = scene.getResources()[2];
//         if (happiness.type === 'Happiness') {
//             expect(happiness.threshold).toBe(20);
//         }
//         const planets = scene.getResources()[3];
//         if (planets.type === 'PlanetsCapacity') {
//             expect(planets.maxCapacity).toBe(5);
//         }
//         const fleet = scene.getResources()[4];
//         if (fleet.type === 'FleetCapacity') {
//             expect(fleet.maxCapacity).toBe(6);
//         }
//         const influence = scene.getResources()[5];
//         if (influence.type === 'Influence') {
//             expect(influence.perTurn).toBe(2);
//         }
//     });

//     it('should update resources and turn correctly on nextTurn', () => {
//         const scene = new GameScene();
//         scene.create();
//         // Set resources with thresholds for testing
//         scene.setResources([
//             {
//                 type: 'Crypto',
//                 amount: 5,
//                 perTurn: 2,
//                 icon: scene.resources[0].icon
//             },
//             {
//                 type: 'Science',
//                 amount: 9,
//                 perTurn: 2,
//                 threshold: 10,
//                 icon: scene.resources[2].icon
//             },
//             {
//                 type: 'Happiness',
//                 amount: 49,
//                 perTurn: 2,
//                 threshold: 50,
//                 icon: scene.resources[3].icon
//             },
//             {
//                 type: 'PlanetsCapacity',
//                 amount: 1,
//                 maxCapacity: 2,
//                 icon: scene.resources[4].icon
//             },
//             {
//                 type: 'FleetCapacity',
//                 amount: 1,
//                 maxCapacity: 2,
//                 icon: scene.resources[5].icon
//             },
//             {
//                 type: 'Influence',
//                 amount: 3,
//                 perTurn: 1,
//                 icon: scene.resources[1].icon
//             }
//         ]);
//         // Spy on console.log for threshold
//         const logSpy = jest.spyOn(console, 'log');
//         scene.nextTurn();
//         expect(scene.getTurn()).toBe(2);
//         const updatedResources = scene.getResources();
//         expect(updatedResources[0].amount).toBe(7); // Crypto: 5+2
//         expect(updatedResources[1].amount).toBe(1); // Science: 9+2=11, threshold=10, 11-10=1
//         expect(updatedResources[2].amount).toBe(1); // Happiness: 49+2=51, threshold=50, 51-50=1
//         expect(updatedResources[3].amount).toBe(1); // PlanetsCapacity unchanged
//         expect(updatedResources[4].amount).toBe(1); // FleetCapacity unchanged
//         expect(updatedResources[5].amount).toBe(4); // Influence: 3+1
//         expect(logSpy).toHaveBeenCalledWith('Threshold reached for Science: 10');
//         expect(logSpy).toHaveBeenCalledWith('Threshold reached for Happiness: 50');
//         logSpy.mockRestore();
//     });
// });
