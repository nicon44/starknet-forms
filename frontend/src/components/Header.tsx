import { useStarknet } from "@starknet-react/core";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import WalletConnector from "./WalletConnector";

const Header = () => {
  const { account } = useStarknet();

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand>Starknet Forms</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {account && (
              <>
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/complete-form">
                  Complete Form
                </Nav.Link>
                <Nav.Link as={Link} to="/create-form">
                  Create Form
                </Nav.Link>
                <Nav.Link as={Link} to="/leaderboard">
                  Leaderboard
                </Nav.Link>
              </>
            )}
          </Nav>
          <div className="d-flex">
            <WalletConnector />
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
