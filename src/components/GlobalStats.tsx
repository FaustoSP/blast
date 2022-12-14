import { UserOutlined } from "@ant-design/icons";
import { Card, Checkbox, Collapse, Descriptions, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useState, useEffect } from "react";
import { Accolade } from "../classes/Accolade";
import { Weapon } from "../classes/Weapon";

const { Panel } = Collapse;

interface GlobalStatsProps {
  finalScore: string | undefined;
  winner: string | undefined;
  accolades: Accolade[] | undefined;
  weapons: Weapon[] | undefined;
  spectators: string[] | undefined;
}

// Formats the name of the accolades into a more legible one.
// While I did find a name of all accolades, I could not a find a list of the internal names they have for the logs
// So this is more of a demo of how I would handle this situation.
const accoladeNamesMap: Map<string, string> = new Map([
  ["pistolkills", "Pistol Kills"],
  ["burndamage", "Burn Damage"],
  ["firstkills", "Most first kills"],
  ["hsp", "hsp"],
  ["kills", "Kills"],
  ["4k", "4K"],
  ["3k", "3K"],
  ["cashspent", "Most money spent"],
  ["objectsDestroyed", "Bull in a china shop (most objects destroyed)"],
]);

function GlobalStats(props: GlobalStatsProps) {
  const [team1, setTeam1] = useState<string>("");
  const [team2, setTeam2] = useState("");
  const [score, setScore] = useState<string>("");
  const [spoil, setSpoil] = useState<boolean>(false);
  const [weaponsOrderedByKills, setWeaponsOrderedByKills] = useState<Weapon[]>(
    []
  );

  function toogleSpoilers() {
    setSpoil(!spoil);
  }

  useEffect(() => {
    if (props.finalScore) {
      setTeam1(props.finalScore.slice(0, props.finalScore.indexOf("[") - 1));
      setScore(
        props.finalScore.slice(
          props.finalScore.indexOf("[") + 1,
          props.finalScore.indexOf("]")
        )
      );
      setTeam2(
        props.finalScore.slice(
          props.finalScore.indexOf("]") + 2,
          props.finalScore.length
        )
      );
    }
  }, [props.finalScore]);

  useEffect(() => {
    if (props.weapons) {
      // Array.sort() mutates the original array, so its good practice to copy it to another var first
      const ordered = [...props.weapons].sort((a, b) => b.kills - a.kills);
      setWeaponsOrderedByKills(ordered);
    }
  }, [props.weapons]);

  return (
    <Space direction="vertical">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "1000px",
        }}
      >
        <Card style={{ width: "100vh" }}>
          <Title>{team1}</Title>
        </Card>
        <Title>VS</Title>
        <Card style={{ width: "100vh" }}>
          <Title>{team2}</Title>
        </Card>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "1000px",
          backgroundColor: "white",
        }}
      >
        <Descriptions
          title="Spectators"
          contentStyle={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "1000px",
          }}
        >
          {props?.spectators?.map((spectator) => (
            <div key={spectator}>
              <Descriptions.Item label="Spectator">
                {spectator}
              </Descriptions.Item>
            </div>
          ))}
        </Descriptions>
      </div>
      <div>
        <Card
          style={{ width: "156vh" }}
          title={<Checkbox onChange={toogleSpoilers}>Spoil me!</Checkbox>}
        >
          {spoil && <Title>Final Score: {score}</Title>}
        </Card>
      </div>
      <div>
        <Card style={{ width: "156vh" }} title={<Title>Accolades</Title>}>
          <Collapse defaultActiveKey={["1"]}>
            <Panel header="See all accolades" key="1">
              {props.accolades?.map((accolade) => (
                <div
                  key={
                    accolade.name +
                    accolade.pos +
                    accolade.player +
                    accolade.value +
                    accolade.score
                  }
                >
                  <>
                    <Title level={4}>
                      {accoladeNamesMap.get(accolade.name)}
                    </Title>
                    <p>
                      <UserOutlined /> {accolade.player}
                    </p>
                    <p>
                      Position: {accolade.pos} Value: {accolade.value} Score:{" "}
                      {accolade.score}
                    </p>
                  </>
                </div>
              ))}
            </Panel>
          </Collapse>
        </Card>
      </div>
      <div>
        <Card style={{ width: "156vh" }} title={<Title>Weapon Stats</Title>}>
          <Collapse defaultActiveKey={["1"]}>
            <Panel header="Top 5 causes of death" key="1">
              {weaponsOrderedByKills.slice(0, 5).map((weapon) => (
                <div key={weapon.nameWithContext}>
                  <Title level={4}>{weapon.nameWithContext}</Title>
                  <p>Kills: {weapon.kills}</p>
                </div>
              ))}
            </Panel>
          </Collapse>
        </Card>
      </div>
    </Space>
  );
}

export default GlobalStats;
