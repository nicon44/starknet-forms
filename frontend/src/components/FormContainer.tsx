import { useStarknetInvoke } from "@starknet-react/core";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormContract } from "../hooks/useFormContract";
import stringToHex from "../utils/stringToHex";
import CompleteForm from "./Form";
import FormSelector from "./FormSelector";

const FormContainer = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const initId = id ? +id : undefined;
  const [formId, setFormId] = useState<number | undefined>(initId);
  const { contract: test } = useFormContract();
  const { invoke } = useStarknetInvoke({
    contract: test,
    method: "send_answer",
  });

  const loadForm = (id: number) => {
    setFormId(id);
  };

  const submitHandler = (nickname: string, result: string) => {
    const args = [formId, stringToHex(nickname), result];
    invoke({ args })
      .then((response) => {
        navigate("/my-results");
      })
      .catch((e) => {
        alert("Error");
        console.error("error", e);
      });
  };

  return (
    <div>
      {!formId && formId !== 0 && <FormSelector onSubmit={loadForm} />}
      {(formId || formId === 0) && (
        <CompleteForm id={formId} onSubmit={submitHandler} />
      )}
    </div>
  );
};

export default FormContainer;
