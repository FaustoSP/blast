// Class that represents a single player
export class Player {
  name: string;
  kills: number;
  objectsDestroyed: number;

  constructor(name: string, kills: number, objectsDestroyed: number) {
    this.name = name;
    this.kills = kills;
    this.objectsDestroyed = objectsDestroyed;
  }
}
