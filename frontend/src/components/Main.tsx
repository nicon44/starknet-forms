import { useStarknet } from "@starknet-react/core";
import { Route, Routes } from "react-router-dom";
import CreateForm from "./CreateForm";
import FormContainer from "./FormContainer";
import Home from "./Home";
import LeaderboardContainer from "./LeaderboardContainer";

export default function Main() {
  const { account } = useStarknet();

  return (
    <div className="container">
      {account ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complete-form" element={<FormContainer />} />
          <Route path="/create-form" element={<CreateForm />} />
          <Route
            path="/leaderboard"
            element={<LeaderboardContainer account={account} />}
          />
        </Routes>
      ) : (
        <p>Please, connect your wallet to continue</p>
      )}
    </div>
  );
}
