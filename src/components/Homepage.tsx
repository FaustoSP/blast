import { ChronoUnit, DateTimeFormatter, LocalTime } from "@js-joda/core";
import { useEffect, useState } from "react";
import { Player } from "../classes/Player";
import { Round } from "../classes/Round";
import { Weapon } from "../classes/Weapon";
import { getPlayerNameFromLine, removeQuotes } from "../utils/StringUtils";

// Asumption: the date and time pattern is always MM/dd/yyyy - HH:mm:ss and they are always at the start of a line
// I think this is an ok assumption to make given that logs should always follow a specific formatting for them to be useful
// Further, I'm only taking the time because the date is irrelevant for this example, though it could easily be incorporated
// and processed using LocalDateTime
function getTimeOfLine(line: string): LocalTime {
  const formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
  return LocalTime.parse(line.slice(13, 21), formatter);
}

// Note that, ideally, the processing of the data would be done by a backend and exposed to the frontend via
// an API, but for the purpose of this code challenge, and to save time, it will be done in the frontend.
const Homepage = () => {
  const [rawData, setRawData] = useState<string[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  // The only thing I care about the spectators is their names, so I'm not adding a whole new class for them.
  const [spectators, setSpectators] = useState<string[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);

  // We load the data from the txt file, divide it by lines with a regular expression
  // Then store it in a state variable as an array of strings
  useEffect(() => {
    //const data = require("../data/firstRoundOnly.txt");
    // Used for testing and debugging. Leaving it here in case its useful to whoever is reviewing this.
    const data = require("../data/NAVIvsVitaGF-Nuke.txt");
    fetch(data)
      .then((response) => response.text())
      .then((text) => setRawData(text.split(/\r\n|\r|\n/)));
  }, []);

  useEffect(() => {
    let data = trimPreMatchData(rawData);
    if (data) {
      let rounds = divideDataByRounds(data);
      setRounds(rounds);
    }
  }, [rawData]);

  useEffect(() => {
    console.log(weapons);
  }, [weapons]);

  // As per the hint "There might be multiple “Match_Start” events, but only the last one starts the match for real."
  // So this function eliminates all the lines preceding the last "Match_Start"
  function trimPreMatchData(rawData: string[]): string[] {
    let trueMatchStartIndex: number = -1;
    let spectators: string[] = [];

    rawData.forEach((line, index) => {
      if (line.indexOf("Match_Start") !== -1) trueMatchStartIndex = index;

      if (
        line.indexOf("switched from team <Unassigned> to <Spectator>") !== -1
      ) {
        if (!spectators.includes(getPlayerNameFromLine(line)))
          spectators.push(getPlayerNameFromLine(line));
      }
    });

    let trimmedData: string[] = rawData.slice(
      trueMatchStartIndex,
      rawData.length
    );

    setSpectators(spectators);
    return trimmedData;
  }

  // Divides the log into rounds. A round is defined as all the lines between "Round_Start" and "Round_End", exclusive in both cases.
  // At the same time, also parses player statistics. I tried to minimize the amount of times I loop through the data.
  // Note: I tried to keep the cognitive complexity of this function as low as realistically possible, but there is room for improvement
  function divideDataByRounds(data: string[]): Round[] {
    let roundLength: number,
      currentRound = 1;
    let ctTeam: string,
      terroristTeam: string,
      score: string | undefined,
      winner: string;
    // The kill feed for each round. See the processKillLine function. Resetted each time a new Round is processed.
    let killFeedPerRound: string[] = [];
    let roundStart: LocalTime;
    let auxRounds: Round[] = [];
    let auxPlayers: Player[] = [];
    let auxWeapons: Weapon[] = [];

    // Regular expression used to match the lines where an admin announces the score.
    // Example of a desired math: [FACEIT^] NAVI GGBET [0 - 4] TeamVitality
    // I tried to make it as generic as possible, but a team with a special character, or the score being announced
    // in a different format could break it. However, I think its good enough for the code challenge.
    const regexScore = /[A-Za-z0-9]+\s\[[0-9]+\s-\s[0-9]+\]\s[A-Za-z0-9]+/i;

    data.forEach((line, index) => {
      if (line.indexOf("Round_Start") !== -1) {
        roundStart = getTimeOfLine(line);
      }

      if (line.indexOf('MatchStatus: Team playing "CT":') !== -1)
        ctTeam = line.slice(55, line.length);

      if (line.indexOf('MatchStatus: Team playing "TERRORIST":') !== -1)
        terroristTeam = line.slice(62, line.length);

      if (line.indexOf("money change") !== -1)
        processPurchaseLine(line, auxPlayers);

      if (line.indexOf("left buyzone with") !== -1)
        processLeftBuyzoneWithLine(line, auxPlayers, currentRound);

      if (line.indexOf("attacked") !== -1) processDamageLine(line, auxPlayers);

      if (line.indexOf("killed") !== -1)
        processKillLine(line, auxPlayers, killFeedPerRound, auxWeapons);

      if (line.indexOf("SFUI_Notice_") !== -1) {
        if (
          line.indexOf("SFUI_Notice_Target_Bombed") !== -1 ||
          line.indexOf("SFUI_Notice_Terrorists_Win") !== -1
        ) {
          winner = "Terrorists";
        }
        if (
          line.indexOf("SFUI_Notice_CTs_Win") !== -1 ||
          line.indexOf("SFUI_Notice_Bomb_Defused") !== -1
        )
          winner = "Counter Terrorists";
      }

      // Immediately after each round ends, the admin announces the score. This is very convenient, and I take advantage
      // by using it as the indicator that the round is over.
      score = line.match(regexScore)?.toString();
      if (score) {
        currentRound++;
        // The length is stored in seconds
        roundLength = roundStart.until(getTimeOfLine(line), ChronoUnit.SECONDS);

        // Resets the array that keeps track of players damaged this round.
        auxPlayers = auxPlayers.map((player) => {
          player.playersDamagedThisRound = [];
          return player;
        });

        auxRounds.push(
          new Round(
            roundLength,
            ctTeam,
            terroristTeam,
            score,
            winner,
            killFeedPerRound
          )
        );

        killFeedPerRound = [];
      }

      if (index === 5) console.log("For this rounds, players", auxPlayers);
    });

    setPlayers(auxPlayers);
    setWeapons(auxWeapons);
    console.log(auxRounds);
    return auxRounds;
  }

  // The log does not provide me with a list of players and spectators, so I extract that data now.
  // I could use the pattern "xxx<nn><XXXXX><>" entered the game", but due to the way react set states
  // asynchronously, attempting to set the same state twice can cause a race condition, so I only do it
  // once right here.
  // While this way is slightly less efficient than only checking the pre-match log, it accounts for cases
  // where not all players or spectators are present before the first round (for example, what if they have backups?)
  function processKillLine(
    line: string,
    auxPlayers: Player[],
    killFeed: string[],
    auxWeapons: Weapon[]
  ) {
    const attackerPlayer = getPlayerNameFromLine(line);
    const weaponUsed = removeQuotes(
      line.slice(line.indexOf(" with") + 6, line.length)
    );

    addPlayerIfNotPresent(attackerPlayer, auxPlayers);

    // "killed other" indicates the destruction of an object, otherwise a player was killed
    if (line.indexOf("killed other") !== -1) {
      auxPlayers = auxPlayers.map((player) => {
        if (player.name === attackerPlayer) player.objectsDestroyed++;
        return player;
      });
    } else {
      const trimmedLine = line.slice(line.indexOf("killed"), line.length);
      const attackedPlayer = trimmedLine.slice(8, trimmedLine.indexOf("<"));
      // This variable stores the complete kill with everyone who participated and the weapon used. Example:
      // Brutus + Longinus killed Caesar with Knife
      // The name of the var could stand to be more descriptive, can't think of anything better right now.
      let completeKill: string = attackerPlayer;

      // The attacker gets the kill. Everyone who isn't the attacker AND damaged the killed previously gets and assist.
      auxPlayers = auxPlayers.map((player) => {
        if (player.name === attackerPlayer) {
          player.kills++;
        } else {
          if (
            player.playersDamagedThisRound.some(
              (previouslyDamaged) => previouslyDamaged === attackedPlayer
            )
          ) {
            player.assists++;
            // If this player previously damaged the killed, then concatenate his name to the kill feed.
            completeKill += " + " + player.name;
          }
        }
        return player;
      });

      completeKill += " killed " + attackedPlayer + " using " + weaponUsed;
      killFeed.push(completeKill);

      parseWeapon(auxWeapons, weaponUsed);
    }

    // I only count headshots on kills, though perhaps it would be interesting to track accuracy
    // or a heatmap of where each player lands the most shots.
    // However, while the heatmap idea is cool, I think its too long and complex for this challenge
    if (line.indexOf("headshot") !== -1) {
      auxPlayers = auxPlayers.map((player) => {
        if (player.name === attackerPlayer) player.headshots++;
        return player;
      });
    }
  }

  function processDamageLine(line: string, auxPlayers: Player[]) {
    const attackerPlayer = getPlayerNameFromLine(line);

    // There is probably a regex expression to do this more efficiently
    const trimmedLine = line.slice(line.indexOf("attacked"), line.length);
    const attackedPlayer = trimmedLine.slice(10, trimmedLine.indexOf("<"));

    addPlayerIfNotPresent(attackerPlayer, auxPlayers);
    addPlayerIfNotPresent(attackedPlayer, auxPlayers);

    auxPlayers = auxPlayers.map((player) => {
      if (player.name === attackerPlayer) {
        if (
          !player.playersDamagedThisRound.some(
            (previouslyDamaged) => previouslyDamaged === attackedPlayer
          )
        )
          player.playersDamagedThisRound.push(attackedPlayer);

        return player;
      }
      return player;
    });
  }

  function processPurchaseLine(line: string, auxPlayers: Player[]) {
    const playerName = getPlayerNameFromLine(line);
    addPlayerIfNotPresent(playerName, auxPlayers);

    // I match to this patter instead of just [0-9]+ because I'm interested on money spent, not gained
    // nor the original amount before change
    const regexMoneyNumber = /-[0-9]+/i;
    const moneySpentString = line
      .match(regexMoneyNumber)
      ?.toString()
      .substring(1);
    const moneySpent: number = moneySpentString ? +moneySpentString : 0;

    auxPlayers = auxPlayers.map((player) => {
      if (player.name === playerName) player.moneySpent += moneySpent;
      return player;
    });
  }

  function processLeftBuyzoneWithLine(
    line: string,
    auxPlayers: Player[],
    round: number
  ) {
    const playerName = getPlayerNameFromLine(line);
    addPlayerIfNotPresent(playerName, auxPlayers);

    // I use this regex because if I simply matched anything between bracket, it would return a ton of false positives
    // There is probably a better regex, but this is good enough. And regex is complicated.
    const regexBuyzone = /left buyzone with \[[^\]]*]/i;
    const equipment = line.match(regexBuyzone)?.toString().substring(18);

    auxPlayers = auxPlayers.map((player) => {
      // This is the simplest way to add assists. The problem is that, if a player non lethaly damages another
      // Then finishes him or her off in a different damage instance, it will count as both a kill and an asssist
      // I will handle this in the display component, though there is probably a better way of doing this
      if (player.name === playerName && equipment)
        player.leftBuyZoneWith.set(round, equipment);
      return player;
    });
  }

  // If the player hasn't been added yet to the array of players, then adds it
  function addPlayerIfNotPresent(name: string, auxPlayers: Player[]) {
    if (!auxPlayers.some((player) => player.name === name))
      auxPlayers.push(new Player(name));
  }

  function parseWeapon(auxWeapons: Weapon[], weaponUsed: string) {
    if (auxWeapons.some((weapon) => weapon.nameWithContext === weaponUsed)) {
      auxWeapons.map((weapon) => {
        if (weapon.nameWithContext === weaponUsed) weapon.kills++;
      });
    } else {
      auxWeapons.push(new Weapon(weaponUsed));
    }
  }

  return (
    <div>
      <div>Homepage</div>
      <p>{`The duration of the first round was: ${
        rounds[0]?.length / 60
      } minutes and ${rounds[0]?.length % 60} seconds`}</p>
      <p>{`The duration of the second round was: ${
        rounds[0]?.length / 60
      } minutes and ${rounds[1]?.length % 60} seconds`}</p>
      <p>{`The duration of the third round was: ${
        rounds[0]?.length / 60
      } minutes and ${rounds[2]?.length % 60} seconds`}</p>
    </div>
  );
};

export default Homepage;
