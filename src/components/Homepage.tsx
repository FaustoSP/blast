import { ChronoUnit, DateTimeFormatter, LocalTime } from "@js-joda/core";
import { useEffect, useState } from "react";
import { Player } from "../classes/Player";
import { Round } from "../classes/Round";
import { getPlayerNameFromLine } from "../utils/StringUtils";

// Asumption: the date and time pattern is always 11/28/2021 - 20:41:20 and they are always at the start of a line
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
  const [spectators, setSpectators] = useState<string[]>([]);

  // We load the data from the txt file, divide it by lines with a regular expression
  // Then store it in a state variable as an array of strings
  useEffect(() => {
    const data = require("../data/NAVIvsVitaGF-Nuke.txt");
    fetch(data)
      .then((response) => response.text())
      .then((text) => setRawData(text.split(/\r\n|\r|\n/)));
  }, []);

  useEffect(() => {
    let data = trimPreMatchData(rawData);
    //if (data[0]) console.log(getTimeOfLine(data[0]).toString());
    if (data) {
      let rounds = divideDataByRounds(data);
      setRounds(rounds);
    }
  }, [rawData]);

  useEffect(() => {
    console.log(players);
  }, [players]);

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
  function divideDataByRounds(data: string[]): Round[] {
    let roundLength: number;
    let ctTeam: string, terroristTeam: string, playerName: string;
    let roundStart: LocalTime;
    let rounds: Round[] = [];
    let auxPlayers: Player[] = [];

    data.forEach((line, index) => {
      if (line.indexOf("Round_Start") !== -1) {
        roundStart = getTimeOfLine(line);
      }

      if (line.indexOf('MatchStatus: Team playing "CT":') !== -1)
        ctTeam = line.slice(55, line.length);

      if (line.indexOf('MatchStatus: Team playing "TERRORIST":') !== -1)
        terroristTeam = line.slice(62, line.length);

      // The log does not provide me with a list of players and spectators, so I extract that data now.
      // I could use the pattern "xxx<nn><XXXXX><>" entered the game", but due to the way react set states
      // asynchronously, attempting to set the same state twice can cause a race condition, so I only do it
      // once right here.
      if (line.indexOf("killed") !== -1) {
        playerName = getPlayerNameFromLine(line);
        if (!auxPlayers.some((player) => player.name === playerName))
          auxPlayers.push(new Player(playerName, 0, 0));
        if (line.indexOf("killed other") !== -1) {
          auxPlayers = auxPlayers.map((player) => {
            if (player.name === getPlayerNameFromLine(line))
              player.objectsDestroyed++;
            return player;
          });
        } else {
          auxPlayers = auxPlayers.map((player) => {
            if (player.name === getPlayerNameFromLine(line)) player.kills++;
            return player;
          });
        }
      }

      if (line.indexOf("Round_End") !== -1) {
        // The length is stored in seconds
        roundLength = roundStart.until(getTimeOfLine(line), ChronoUnit.SECONDS);
        rounds.push(new Round(roundLength, ctTeam, terroristTeam));
      }
    });

    console.log(auxPlayers);
    setPlayers(auxPlayers);
    return rounds;
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
