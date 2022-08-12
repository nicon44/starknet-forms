import React from "react";
import "./App.css";
import {
  StarknetProvider,
  getInstalledInjectedConnectors,
} from "@starknet-react/core";
import Main from "./components/Main";
import Header from "./components/Header";

function App() {
  const connectors = getInstalledInjectedConnectors();

  return (
    <StarknetProvider connectors={connectors}>
      <Header />
      <Main />
    </StarknetProvider>
  );
}

export default App;
