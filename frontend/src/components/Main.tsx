import { useStarknet } from "@starknet-react/core";
import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import CreateForm from "./CreateForm";
import FormContainer from "./FormContainer";
import Home from "./Home";
import LeaderboardContainer from "./LeaderboardContainer";

export default function Main() {
  const { account } = useStarknet();

  return (
    <Container className="mt-3">
      {account ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complete-form" element={<FormContainer />} />
          <Route path="/create-form" element={<CreateForm />} />
          <Route path="/leaderboard" element={<LeaderboardContainer />} />
        </Routes>
      ) : (
        <p>Please, connect your wallet to continue</p>
      )}
    </Container>
  );
}
