// Class that represents a round. Used to store the data of one round.
export class Round {
  // The row length, in seconds
  length: number;
  ctTeam: string;
  terroristTeam: string;
  // The score at the end of the round, as announced by the admin
  score: string;
  winner: string;
  // Stores all the information about a kill. The first player is the killer, then all the assists then the weapon used by the killer
  // Example: Brutus + Longinus killed Caesar with Knife
  killFeed: string[] = [];

  constructor(
    length: number,
    ctTeam: string,
    terroristTeam: string,
    score: string,
    winner: string,
    killFeed: string[] = []
  ) {
    this.length = length;
    this.ctTeam = ctTeam;
    this.terroristTeam = terroristTeam;
    this.score = score;
    this.winner = winner;
    this.killFeed = killFeed;
  }
}
