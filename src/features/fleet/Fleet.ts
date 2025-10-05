import { Commander } from '../commander/Commander';
import { type Faction } from '../common/types';

export class Fleet {
    id: string;
    commander: Commander = new Commander({ id: 'commander-1', name: 'Admiral Kryos Vantrel' });
    faction: Faction = 'Human';
    cards: unknown[] = [];

    constructor() {
        this.id = 'fleet-1';
    }
}
