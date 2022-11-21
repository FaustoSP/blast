// Class that represents a single player
export class Player {
  name: string;
  kills: number = 0;
  assists: number = 0;
  objectsDestroyed: number = 0;
  headshots: number = 0;
  moneySpent: number = 0;
  // Tracks what equipment the player had when they left the buyzone, per round.
  leftBuyZoneWith: Map<number, string> = new Map([]);

  constructor(name: string) {
    this.name = name;
  }
}
