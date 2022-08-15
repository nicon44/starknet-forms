import { Button, Modal } from "react-bootstrap";
import Leaderboard from "./Leaderboard";

const ResultsModal = (props: any) => {
  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Results of form {props.id}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Leaderboard formId={props.id}></Leaderboard>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide} variant="secondary">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResultsModal;
