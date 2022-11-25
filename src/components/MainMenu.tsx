import { useState } from "react";
import {
  GlobalOutlined,
  OrderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, MenuProps } from "antd";
import { Menu } from "antd";
import GlobalStats from "./GlobalStats";
import { Player } from "../classes/Player";
import { Round } from "../classes/Round";
import { Weapon } from "../classes/Weapon";
import { Accolade } from "../classes/Accolade";

const items: MenuProps["items"] = [
  {
    label: "Global Stats",
    key: "global",
    icon: <GlobalOutlined />,
  },
  {
    label: "Rounds",
    key: "round",
    icon: <OrderedListOutlined />,
  },
  {
    label: "Players",
    key: "player",
    icon: <UserOutlined />,
  },
];

// I put every submenu under the same url for convenience's sake. But its also possible to assign one url
// to each submenu (/global, /players, /rounds) and use react router to direct the user to each section.

interface MainMenuProps {
  spectators: string[];
  players: Player[];
  rounds: Round[];
  weapons: Weapon[];
  accolades: Accolade[];
}

function MainMenu(props: MainMenuProps) {
  const [current, setCurrent] = useState<string>("global");

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  return (
    <div>
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        mode="horizontal"
        items={items}
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
      />
      {current === "global" ? (
        <GlobalStats
          finalScore={props.rounds.at(-1)?.score}
          winner={props.rounds.at(-1)?.winner}
          accolades={props.accolades}
          weapons={props.weapons}
        />
      ) : (
        ""
      )}
      {current === "player" ? <Card>rounds</Card> : ""}
      {current === "round" ? <Card>players</Card> : ""}
    </div>
  );
}

export default MainMenu;
