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
  // To properly calculate assists, we need to memorize which players were already damaged this round.
  // This is meant to be resetted each round. Note that kills don't count as damaged.
  // Perhaps a cleaner way of doing this would be to make it a separate class, but this is good enough for now I think.
  playersDamagedThisRound: string[] = [];

  constructor(name: string) {
    this.name = name;
  }
}
