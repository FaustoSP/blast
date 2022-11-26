import { Round } from "../classes/Round";
import { Card, Col, List, Row, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import { Line } from "@ant-design/charts";

interface RoundStatsProps {
  rounds: Round[] | undefined;
}

interface ChartDataType {
  roundNumber: number;
  kills: number;
}

function getFormattedTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds - minutes * 60;
  return `${minutes} minutes and ${seconds} seconds`;
}

function RoundStats(props: RoundStatsProps) {
  const [data, setData] = useState<ChartDataType[]>([]);

  const chartConfig = {
    data,
    xField: "roundNumber",
    yField: "kills",
    stepType: "vh",
    title: "Kills per round",
    meta: {
      roundNumber: {
        alias: "test",
      },
    },
  };

  useEffect(() => {
    let data: ChartDataType[] = [];
    if (props.rounds) {
      for (let i = 0; i < props.rounds.length; i++) {
        data.push({
          roundNumber: i + 1,
          kills: props.rounds[i].killFeed.length,
        });
      }
    }
    setData(data);
  }, [props.rounds]);

  return (
    <Space direction="vertical">
      {props.rounds?.map((round, index) => (
        <div
          key={
            round.ctTeam +
            round.killFeed +
            round.length +
            round.score +
            round.terroristTeam +
            round.winner
          }
        >
          <Card title={`Round ${index + 1}`} style={{ width: "156vh" }}>
            <Row>
              <Col span={12}>
                <Title
                  level={5}
                >{`Counter Terrorists: ${round?.ctTeam}`}</Title>
              </Col>
              <Col span={12}>
                <Title level={5}>{`Terrorists: ${round?.terroristTeam}`}</Title>
              </Col>
            </Row>

            <Title level={3}>{`Winner: ${round?.winner}`}</Title>
            <Title level={4}>{`Score: ${round?.score}`}</Title>
            <p>{`The round lasted ${getFormattedTime(
              round?.length
            )} seconds`}</p>

            <List
              size="small"
              header={<Title level={5}>Kill feed</Title>}
              footer={
                <div>Killer is the one most to the left, rest are assists</div>
              }
              bordered
              dataSource={round?.killFeed}
              renderItem={(item) => <List.Item>{item}</List.Item>}
            />
          </Card>
        </div>
      ))}
      <div>
        <Card title={<Title level={3}>Kills per round</Title>}>
          <Line {...chartConfig} />
        </Card>
      </div>
    </Space>
  );
}

export default RoundStats;
