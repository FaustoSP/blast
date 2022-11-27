import { Card, Collapse, Space } from "antd";
import Title from "antd/es/typography/Title";
import { Player } from "../classes/Player";

const { Panel } = Collapse;

interface PlayerStatsProps {
  players: Player[] | undefined;
}

function PlayerStats(props: PlayerStatsProps) {
  return (
    <Space direction="vertical">
      {props.players?.map((player) => (
        <div
          key={
            player.name // A better solution would be to use the Steam ID, I think.
          }
        >
          <>
            <Card
              style={{ width: "156vh" }}
              title={<Title level={1}>{player.name}</Title>}
            >
              <p>
                <b>Kills (Headshots) / Deaths / Assists</b>
              </p>
              <p>{`${player?.kills} (${player?.headshots}) / ${player?.deaths} / ${player?.assists}`}</p>

              <p>{`Total money spent ${player.moneySpent}`}</p>
              <Collapse defaultActiveKey={[]}>
                <Panel header="Equipment at the start of each round" key="1">
                  {/* The equipment string doesn't look very good, the names need to be mapped to a more legible one */}
                  {/* and the string needs to be touched up a little. I don't think the ROI on time is worth it for the challenge, though. */}
                  {player.leftBuyZoneWith.map((equipment, index) => (
                    <>
                      <Title level={5}>{`Round ${index + 1}`}</Title>
                      <div key={0}>{equipment}</div>
                    </>
                  ))}
                </Panel>
              </Collapse>
            </Card>
          </>
        </div>
      ))}
    </Space>
  );
}

export default PlayerStats;
