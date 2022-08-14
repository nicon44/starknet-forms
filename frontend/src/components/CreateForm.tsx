import { useStarknetInvoke } from "@starknet-react/core";
import { useState } from "react";
import { useFormContract } from "../hooks/useFormContract";
import convertCorrectOption from "../utils/convertCorrectOption";
import responseToString from "../utils/responseToString";
import stringToHex from "../utils/stringToHex";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import "./CreateForm.css";

const CreateForm = () => {
  const { contract: test } = useFormContract();
  const { data, loading, error, reset, invoke } = useStarknetInvoke({
    contract: test,
    method: "create_test",
  });

  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionCorrect, setOptionCorrect] = useState<number | null>(null);
  const [name, setName] = useState("");

  const [questions, setQuestions] = useState<Array<any>>([]);

  const handleRadioChange = (event: any) => {
    const value = event.target.value;
    setOptionCorrect(+value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const payload = {
      args: [name, questions],
    };
    console.log("payload", payload);
    invoke(payload)
      .then((response) => {
        console.log(response);
      })
      .catch((e) => {
        console.log("error", e);
      });

    // get transaction, get id and show form link
  };

  const handleInputChange = (event: any, setFunction: any) => {
    const value = event.target.value;
    setFunction(stringToHex(value));
  };

  const addQuestionHandler = (event: any) => {
    event.preventDefault();
    const newQuestion = {
      description,
      optionA,
      optionB,
      optionC,
      optionD,
      optionCorrect,
    };
    setQuestions((prevQuestions: any) => {
      return [...prevQuestions, newQuestion];
    });
    (document.getElementById("form") as any).reset();
    setDescription("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setOptionCorrect(null);
  };

  return (
    <>
      <Row>
        <Col md="8">
          <h4>Your form:</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Label>Name: </Form.Label>
            <Form.Control
              type="text"
              onChange={(event) => handleInputChange(event, setName)}
            />
            {questions.length === 0 && (
              <p className="mt-3">Add new questions to create a form</p>
            )}
            {questions.length > 0 && <Form.Label>Questions:</Form.Label>}
            {questions.length > 0 &&
              questions.map((question) => {
                return (
                  <ul key={question.description}>
                    <li>
                      Description: {responseToString(question.description)}
                    </li>
                    <li>Option A: {responseToString(question.optionA)}</li>
                    <li>Option B: {responseToString(question.optionB)}</li>
                    <li>Option C: {responseToString(question.optionC)}</li>
                    <li>Option D: {responseToString(question.optionD)}</li>
                    <li>
                      Correct Option:{" "}
                      {convertCorrectOption(question.optionCorrect)}
                    </li>
                  </ul>
                );
              })}
            {questions.length > 0 && <Button type="submit">CREATE FORM</Button>}
          </Form>
        </Col>
        <Col md="4">
          <h4>Add new question</h4>
          <Form id="form" onSubmit={addQuestionHandler}>
            <Form.Label>Description: </Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(event) => handleInputChange(event, setDescription)}
            />
            <Form.Label>Option A: </Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(event) => handleInputChange(event, setOptionA)}
            />
            <Form.Label>Option B: </Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(event) => handleInputChange(event, setOptionB)}
            />
            <Form.Label>Option C: </Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(event) => handleInputChange(event, setOptionC)}
            />
            <Form.Label>Option D: </Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(event) => handleInputChange(event, setOptionD)}
            />
            <Form.Label>Correct Option:</Form.Label> <br />
            <Form.Check
              inline
              label="A"
              type="radio"
              value="0"
              name="correctOption"
              onChange={handleRadioChange}
            />
            <Form.Check
              inline
              label="B"
              type="radio"
              value="1"
              name="correctOption"
              onChange={handleRadioChange}
            />
            <Form.Check
              inline
              label="C"
              type="radio"
              value="2"
              name="correctOption"
              onChange={handleRadioChange}
            />
            <Form.Check
              inline
              label="D"
              type="radio"
              value="3"
              name="correctOption"
              onChange={handleRadioChange}
            />
            <br />
            <Button className="mt-3" type="submit">
              Add question
            </Button>
          </Form>
        </Col>
      </Row>

      {/* TODO: only for testing purposes */}
      <ul className="mt-3">
        <li>Data: {data}</li>
        <li>Loading: {loading}</li>
        <li>Error: {error}</li>
      </ul>
    </>
  );
};

export default CreateForm;
