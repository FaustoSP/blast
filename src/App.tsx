import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Homepage from "./components/Homepage";

function App() {
  return (
    <div
      className="App"
      style={{
        backgroundColor: "#282c34",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Homepage />
    </div>
  );
}

export default App;
