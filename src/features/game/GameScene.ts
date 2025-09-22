import Phaser from "phaser";

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

export type GameTypeProps = "Demo" | "Normal" | "Campaign" | "Skirmish";

export type GameSceneProps = {
  id: string;
  name: string;
  type: GameTypeProps;
  turn: number;
  actions: Action[];
  players?: Player[];
};

export class GameScene extends Phaser.Scene implements GameSceneProps {
  id: string;
  name: string;
  type: GameTypeProps;
  turn: number;
  actions: Action[];
  players: Player[];

  // This constructor initializes the game scene
  constructor() {
    super({ key: "GameScene" });

    this.id = "1";
    this.name = "Demo Game";
    this.type = "Demo";
    this.turn = 1;
    this.actions = [
      {
        id: "1",
        description: "Next Turn",
        event: () => this.nextTurn(),
      },
    ];
    this.players = [];
  }

  create() {
    this.registry.set("id", this.id);
    this.registry.set("name", this.name);
    this.registry.set("type", this.type);
    this.registry.set("turn", this.turn);
    this.registry.set("actions", this.actions);
    this.registry.set("players", this.players);
  }

  getId() {
    return this.registry.get("id") as string;
  }
  setId(id: string) {
    this.registry.set("id", id);
  }

  getName() {
    return this.registry.get("name") as string;
  }
  setName(name: string) {
    this.registry.set("name", name);
  }

  getType() {
    return this.registry.get("type") as GameTypeProps;
  }
  setType(type: GameTypeProps) {
    this.registry.set("type", type);
  }

  getTurn() {
    return this.registry.get("turn") as number;
  }
  setTurn(turn: number) {
    this.registry.set("turn", turn);
  }
  nextTurn() {
    this.setTurn(this.getTurn() + 1);
  }

  getActions() {
    return this.registry.get("actions") as Action[];
  }
  getCurrentAction() {
    const actions = this.getActions();
    return actions.length > 0 ? actions[0] : null;
  }
  addAction(action: Action) {
    const actions = this.registry.get("actions") as Action[];
    this.registry.set("actions", [...actions, action]);
  }

  getPlayers() {
    return this.registry.get("players") as Player[];
  }
  addPlayer(player: Player) {
    const players = this.registry.get("players") as Player[];
    this.registry.set("players", [...players, player]);
  }
}
