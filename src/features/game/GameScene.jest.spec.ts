// Mock Phaser to avoid jsdom/canvas errors
jest.mock("phaser", () => ({
  Scene: class {},
}));

import { GameScene, type Player, type Action } from "./GameScene";

describe("GameScene Unit Tests", () => {
  beforeEach(() => {
    (GameScene.prototype as any).registry = {
      store: {},
      set(key: string, value: unknown) {
        this.store[key] = value;
        return this; // Fix: match DataRegistry type
      },
      get(key: string) {
        return this.store[key];
      },
    };
  });

  it("should initialize with default values", () => {
    const scene = new GameScene();
    expect(scene.id).toBe("1");
    expect(scene.name).toBe("Demo Game");
    expect(scene.type).toBe("Demo");
    expect(scene.turn).toBe(1);
    expect(scene.actions.length).toBe(1);
    expect(scene.players.length).toBe(0);
  });

  it("should set and get id", () => {
    const scene = new GameScene();
    scene.setId("42");
    expect(scene.getId()).toBe("42");
  });

  it("should add player", () => {
    const scene = new GameScene();
    scene.create();
    const player: Player = { id: "p1", name: "Alice" };
    scene.addPlayer(player);
    expect(scene.getPlayers().length).toBe(1);
    expect(scene.getPlayers()[0].name).toBe("Alice");
  });

  it("should advance turn", () => {
    const scene = new GameScene();
    scene.create();
    expect(scene.getTurn()).toBe(1);
    scene.nextTurn();
    expect(scene.getTurn()).toBe(2);
  });

  it("should add action", () => {
    const scene = new GameScene();
    scene.create();
    const action: Action = { id: "2", description: "Test", event: () => {} };
    scene.addAction(action);
    expect(scene.getActions().length).toBe(2);
    expect(scene.getActions()[1].description).toBe("Test");
  });
});
