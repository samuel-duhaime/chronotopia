import { Commander } from '../commander/Commander';
import { type Faction } from '../common/types';



export class Fleet {
    id: string;
    commander: Commander = new Commander();
    faction: Faction = 'Human';
    cards: unknown[] = [];

    constructor() {
        this.id = 'fleet-1';
        this.cards = [];
    }
}
