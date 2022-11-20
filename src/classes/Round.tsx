// Class that represents a round. Used to store the data of one round.
export class Round {
  // The row length, in seconds
  length: number;
  ctTeam: string;
  terroristTeam: string;

  constructor(length: number, ctTeam: string, terroristTeam: string) {
    this.length = length;
    this.ctTeam = ctTeam;
    this.terroristTeam = terroristTeam;
  }
}
