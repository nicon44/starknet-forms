import { useConnectors, useStarknet } from "@starknet-react/core";
import Button from "react-bootstrap/Button";
import NavDropdown from "react-bootstrap/NavDropdown";

const WalletConnector = () => {
  const { available, connect, disconnect } = useConnectors();
  const { account } = useStarknet();

  return (
    <div>
      {!account ? (
        available.map((connector) => (
          <Button key={connector.id()} onClick={() => connect(connector)}>
            {`Connect ${connector.name()}`}
          </Button>
        ))
      ) : (
        <NavDropdown
          title={"0x..." + account.slice(account.length - 6)}
          id="basic-nav-dropdown"
        >
          <NavDropdown.Item onClick={() => disconnect()}>Disconnect</NavDropdown.Item>
        </NavDropdown>
      )}
    </div>
  );
};

export default WalletConnector;
