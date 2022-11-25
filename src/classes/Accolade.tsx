export class Accolade {
  name: string;
  player: string;
  value: number;
  pos: number;
  score: number;

  constructor(
    name: string,
    player: string,
    value: number,
    pos: number,
    score: number
  ) {
    this.name = name;
    this.player = player;
    this.value = value;
    this.pos = pos;
    this.score = score;
  }
}
