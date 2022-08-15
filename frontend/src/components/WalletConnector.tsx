import { useConnectors, useStarknet } from "@starknet-react/core";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import "./WalletConnector.css";

const LS_WALLET = "connectedWallet";

const WalletConnector = () => {
  const { available, connect, disconnect } = useConnectors();
  const { account } = useStarknet();
  const [modalShow, setModalShow] = useState(false);

  useEffect(() => {
    const connectedWallet = localStorage.getItem(LS_WALLET);
    if (connectedWallet) {
      const foundConnector = available.find(
        (item) => item.options?.id === connectedWallet
      );
      if (foundConnector) {
        connect(foundConnector);
      }
    }
  }, []);

  const disconnectWallet = () => {
    disconnect();
    localStorage.clear();
  };

  return (
    <div>
      {!account ? (
        <Button variant="primary" onClick={() => setModalShow(true)}>
          Connect wallet
        </Button>
      ) : (
        <NavDropdown
          title={"0x..." + account.slice(account.length - 6)}
          id="basic-nav-dropdown"
        >
          <NavDropdown.Item onClick={disconnectWallet}>
            Disconnect
          </NavDropdown.Item>
        </NavDropdown>
      )}
      <WalletConnectorModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </div>
  );
};

const WalletConnectorModal = (props: any) => {
  const { available, connect } = useConnectors();
  const argentX =
    available && available.find((connector) => connector.id() === "argent-x");
  const braavos =
    available && available.find((connector) => connector.id() === "braavos");
  const connectWallet = (connector: any) => () => {
    connect(connector);
    localStorage.setItem(LS_WALLET, connector.options?.id);
    props.onHide();
  };
  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Connect a wallet
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <div className="wallets">
          <div
            onClick={connectWallet(argentX)}
            className={!argentX ? "wallet not-found" : "wallet"}
          >
            <img src="argentx.jpeg" alt="Argent X" />
            <span>Argent X</span>
          </div>
          <div
            onClick={connectWallet(braavos)}
            className={!braavos ? "wallet not-found" : "wallet"}
          >
            <img src="braavos.jpeg" alt="Argent X" />
            <span>Braavos</span>
          </div>
        </div>
        {!argentX && !braavos && (
          <p className="center mt-3">No wallets found <br />Please install one of the above to continue</p>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default WalletConnector;
