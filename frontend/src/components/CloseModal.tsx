import { useStarknetInvoke } from "@starknet-react/core";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useFormContract } from "../hooks/useFormContract";
import stringToHex from "../utils/stringToHex";

const CloseModal = (props: any) => {
  const { contract: test } = useFormContract();

  const [secret, setSecret] = useState("");

  const handleClose = () => {
    const payload = {
      args: [props.id, stringToHex(secret)],
    };
    invokeClose(payload).catch((e) => {
      alert("There was an error in the transaction");
    });
  };

  const handleSecretChange = (event: any) => {
    setSecret(event.target.value);
  };

  const { invoke: invokeClose } = useStarknetInvoke({
    contract: test,
    method: "close_forms",
  });

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Close form {props.id}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Label>Secret *</Form.Label>
        <Form.Control
          required
          onChange={handleSecretChange}
          type="text"
        />
        <Form.Text className="text-muted">
          Please enter the same secret you used to sign your form.
        </Form.Text>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} variant="secondary">
          Cancel
        </Button>
        <Button onClick={handleClose} variant="danger">
          Close form
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CloseModal;
