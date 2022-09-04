import { useStarknet } from "@starknet-react/core";
import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import CreateForm from "./CreateForm";
import FormContainer from "./FormContainer";
import Home from "./Home";
import "./Main.css";
import MyForms from "./MyForms";
import MyResults from "./MyResults";
import ScoreDetails from "./ScoreDetails";

export default function Main() {
  const { account } = useStarknet();

  return (
    <Container className="mt-3">
      {account ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complete-form" element={<FormContainer />} />
          <Route path="/complete-form/:id" element={<FormContainer />} />
          <Route path="/create-form" element={<CreateForm />} />
          <Route path="/edit-form/:id" element={<CreateForm />} />
          <Route path="/my-forms" element={<MyForms />} />
          <Route path="/my-results" element={<MyResults />} />
          <Route path="/score-details/:id" element={<ScoreDetails />} />
        </Routes>
      ) : (
        <>
          <Home />
          <p className="connect-warning mt-5">
            Please, connect your wallet to start using Starknet Forms
          </p>
        </>
      )}
    </Container>
  );
}
