// Assumes the line has the following format:
// 11/28/2021 - 20:41:40: "NAME<XX><XXXXXX>...."
export function getPlayerNameFromLine(s: string) {
  return s.slice(24, s.indexOf("<"));
}

// Removes quotes from a string
export function removeQuotes(s: string) {
  return s.replace(/['"]+/g, "");
}
