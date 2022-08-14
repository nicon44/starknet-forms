import { useConnectors, useStarknet } from "@starknet-react/core";
import { useEffect } from "react";
import Button from "react-bootstrap/Button";
import NavDropdown from "react-bootstrap/NavDropdown";

const LS_WALLET = 'connectedWallet';

const WalletConnector = () => {
  const { available, connect, disconnect } = useConnectors();
  const { account } = useStarknet();

  useEffect(() => {
    const connectedWallet = localStorage.getItem(LS_WALLET);
    if (connectedWallet) {
      const foundConnector = available.find(item => item.options?.id === connectedWallet);
      if (foundConnector) {
        connect(foundConnector);
      }
    }
  }, [])

  const connectWallet = (connector: any) => () => {
    connect(connector);
    localStorage.setItem(LS_WALLET, connector.options?.id);
  }

  const disconnectWallet = () => {
    disconnect();
    localStorage.clear();
  }

  return (
    <div>
      {!account ? (
        available && available.length > 0 ?
        available.map((connector) => (
          <Button className="ml-1" key={connector.id()} onClick={connectWallet(connector)}>
            {`Connect ${connector.name()}`}
          </Button>
        )) : <span>No wallets found</span>
      ) : (
        <NavDropdown
          title={"0x..." + account.slice(account.length - 6)}
          id="basic-nav-dropdown"
        >
          <NavDropdown.Item onClick={disconnectWallet}>Disconnect</NavDropdown.Item>
        </NavDropdown>
      )}
    </div>
  );
};

export default WalletConnector;
