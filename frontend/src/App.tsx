import {
  getInstalledInjectedConnectors,
  StarknetProvider,
} from "@starknet-react/core";
import "./App.css";
import Header from "./components/Header";
import Main from "./components/Main";

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
