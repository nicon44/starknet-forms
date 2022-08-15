import { useStarknetInvoke } from "@starknet-react/core";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFormContract } from "../hooks/useFormContract";
import CompleteForm from "./Form";
import FormSelector from "./FormSelector";

const FormContainer = () => {
  const {id} = useParams();
  const initId = id ? +id : undefined;
  const [formId, setFormId] = useState<number | undefined>(initId);
  const { contract: test } = useFormContract();
  const { data, loading, error, reset, invoke } = useStarknetInvoke({
    contract: test,
    method: "send_answer",
  });

  const loadForm = (id: number) => {
    setFormId(id);
  };

  const submitHandler = (result: string) => {
    const args = [formId, result];
    invoke({ args })
      .then((response) => {
        setFormId(undefined);
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
