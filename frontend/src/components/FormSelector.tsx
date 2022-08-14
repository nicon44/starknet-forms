import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const FormSelector = (props: { onSubmit: (formId: number) => void }) => {
  const [formId, setFormId] = useState<string>("");

  const idChangeHandler = (event: any) => {
    setFormId(event.target.value);
  };

  const submit = (event: any) => {
    event.preventDefault();
    if (formId) {
      props.onSubmit(+formId);
    } else {
      alert("Insert a numeric value to continue");
    }
  };

  return (
    <Form onSubmit={submit}>
      <Row>
        <Col>
          <Form.Label>
            Please insert the id of the form you want to access:
          </Form.Label>
          <div className="d-flex">
            <Form.Control
              type="number"
              value={formId}
              onChange={idChangeHandler}
              className="w-200"
            />
            <Button className="ml-1" type="submit">
              GO!
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default FormSelector;
