import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

const ShareModal = (props: any) => {
  const link = window.location.origin + "/complete-form/" + props.id;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [link]);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(link);
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
          Share form {props.id}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <Form.Control type="text" value={link} disabled />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} variant="secondary">
          Close
        </Button>
        <Button onClick={handleCopy} disabled={copied} variant="primary">
          {copied ? "Copied" : "Copy link to clipboard"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareModal