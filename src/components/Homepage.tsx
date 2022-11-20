import { DateTimeFormatter, LocalTime } from "@js-joda/core";
import { useEffect, useState } from "react";

// As per the hint "There might be multiple “Match_Start” events, but only the last one starts the match for real."
// So this function eliminates all the lines preceding the last "Match_Start"
function trimPreMatchData(rawData: string[]): string[] {
  let trueMatchStartIndex: number = -1;
  rawData.forEach((line, index) => {
    if (line.indexOf("Match_Start") !== -1) trueMatchStartIndex = index;
  });

  let trimmedData: string[] = rawData.slice(
    trueMatchStartIndex,
    rawData.length
  );

  return trimmedData;
}

// Asumption: the date and time pattern is always 11/28/2021 - 20:41:20 and they are always at the start of a line
// I think this is an ok assumption to make given that logs should always follow a specific formatting for them to be useful
// Further, I'm only taking the time because the date is irrelevant for this example, though it could easily be incorporated
// and processed using LocalDateTime
function getTimeOfLine(line: string): LocalTime {
  const formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
  return LocalTime.parse(line.slice(13, 21), formatter);
}

// Divides the log into rounds. A round is defined as all the lines between "Round_Start" and "Round_End", exclusive in both cases.
function divideDataByRounds(data: string[]): string[][] {
  let matchStartIndex: number = -1;
  let matchEndIndex: number = -1;
  let rounds: string[][] = [];
  data.forEach((line, index) => {
    if (line.indexOf("Round_Start") !== -1) matchStartIndex = index;
    if (line.indexOf("Round_End") !== -1) {
      rounds.push(data.slice(matchStartIndex + 1, index));
    }
  });
  console.log(rounds);
  return rounds;
}

// Note that, ideally, the processing of the data would be done by a backend and exposed to the frontend via
// an API, but for the purpose of this code challenge, and to save time, it will be done in the frontend.
const Homepage = () => {
  const [rawData, setRawData] = useState<string[]>([]);

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
    let rounds: string[][] = [];
    //if (data[0]) console.log(getTimeOfLine(data[0]).toString());
    if (data) {
      rounds = divideDataByRounds(data);
    }
  }, [rawData]);

  return (
    <div>
      <div>Homepage</div>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <p>test</p>
      <p>test</p>
    </div>
  );
};

export default Homepage;
