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
import { FaTrashAlt, FaEdit } from "react-icons/fa";

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

  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  const handleRadioChange = (event: any) => {
    const value = event.target.value;
    setOptionCorrect(+value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const payload = {
      args: [stringToHex(name), hexQuestions()],
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

  const hexQuestions = () => {
    const questionsCopy = [...questions]
    return questionsCopy.map(question => {
      return {
        description: stringToHex(question.description),
        optionA: stringToHex(question.optionA),
        optionB: stringToHex(question.optionB),
        optionC: stringToHex(question.optionC),
        optionD: stringToHex(question.optionD),
        optionCorrect: question.optionCorrect
      }
    })
  }

  const handleInputChange = (event: any, setFunction: any) => {
    const value = event.target.value;
    setFunction(value);
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
    if (!editing()) {
      setQuestions((prevQuestions: any) => {
        return [...prevQuestions, newQuestion];
      });
    } else {
      setQuestions((prevQuestions: any) => {
        const newQuestions = [...prevQuestions]
        newQuestions[editingId!] = newQuestion
        return newQuestions
      })
      setEditingId(undefined)
    }
    resetForm();
  };

  const deleteHandler = (index: number) => () => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions.splice(index, 1);
      return newQuestions;
    });
  };

  const editHandler = (index: number) => () => {
    setEditingId(index);
    const editingQuestion = questions[index];
    setDescription(editingQuestion.description);
    setOptionA(editingQuestion.optionA);
    setOptionB(editingQuestion.optionB);
    setOptionC(editingQuestion.optionC);
    setOptionD(editingQuestion.optionD);
    setOptionCorrect(editingQuestion.optionCorrect);
  };

  const handleCancel = () => {
    setEditingId(undefined);
    resetForm();
  };

  const resetForm = () => {
    (document.getElementById("form") as any).reset();
    setDescription("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setOptionCorrect(null);
  };

  const editing = () => {
    return (!!editingId || editingId === 0);
  }

  return (
    <>
      <Row>
        <Col md="8">
          <h4>Your form:</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Label>Name: </Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(event) => handleInputChange(event, setName)}
            />
            {questions.length === 0 && (
              <p className="mt-3">Add new questions to create a form</p>
            )}
            {questions.length > 0 &&
              questions.map((question, index) => {
                return (
                  <div key={question.description}>
                    <Form.Label>
                      Question {index + 1}
                      <span onClick={editHandler(index)} className="icon">
                        <FaEdit />
                      </span>
                      <span onClick={deleteHandler(index)} className="icon">
                        <FaTrashAlt />
                      </span>
                    </Form.Label>
                    <ul key={question.description}>
                      <li>Description: {question.description}</li>
                      <li>Option A: {question.optionA}</li>
                      <li>Option B: {question.optionB}</li>
                      <li>Option C: {question.optionC}</li>
                      <li>Option D: {question.optionD}</li>
                      <li>
                        Correct Option:{" "}
                        {convertCorrectOption(question.optionCorrect)}
                      </li>
                    </ul>
                  </div>
                );
              })}
            {questions.length > 0 && <Button type="submit">CREATE FORM</Button>}
          </Form>
        </Col>
        <Col md="4">
          {!editing() && <h4>Add new question</h4>}
          {editing() && (
            <h4>Edit question {editingId! + 1}</h4>
          )}
          <Form id="form" onSubmit={addQuestionHandler}>
            <Form.Label>Description: </Form.Label>
            <Form.Control
              type="text"
              required
              value={description}
              onChange={(event) => handleInputChange(event, setDescription)}
            />
            <Form.Label>Option A: </Form.Label>
            <Form.Control
              type="text"
              required
              value={optionA}
              onChange={(event) => handleInputChange(event, setOptionA)}
            />
            <Form.Label>Option B: </Form.Label>
            <Form.Control
              type="text"
              required
              value={optionB}
              onChange={(event) => handleInputChange(event, setOptionB)}
            />
            <Form.Label>Option C: </Form.Label>
            <Form.Control
              type="text"
              required
              value={optionC}
              onChange={(event) => handleInputChange(event, setOptionC)}
            />
            <Form.Label>Option D: </Form.Label>
            <Form.Control
              type="text"
              required
              value={optionD}
              onChange={(event) => handleInputChange(event, setOptionD)}
            />
            <Form.Label>Correct Option:</Form.Label> <br />
            <Form.Check
              inline
              label="A"
              type="radio"
              value="0"
              checked={optionCorrect === 0}
              name="correctOption"
              onChange={handleRadioChange}
            />
            <Form.Check
              inline
              label="B"
              type="radio"
              value="1"
              checked={optionCorrect === 1}
              name="correctOption"
              onChange={handleRadioChange}
            />
            <Form.Check
              inline
              label="C"
              type="radio"
              value="2"
              checked={optionCorrect === 2}
              name="correctOption"
              onChange={handleRadioChange}
            />
            <Form.Check
              inline
              label="D"
              type="radio"
              value="3"
              checked={optionCorrect === 3}
              name="correctOption"
              onChange={handleRadioChange}
            />
            <br />
            {!editing() && (
              <Button className="mt-3" type="submit">
                Add question
              </Button>
            )}
            {editing() && (
              <>
                <Button
                  onClick={handleCancel}
                  variant="danger"
                  className="mt-3"
                  type="button"
                >
                  Cancel
                </Button>
                <Button className="mt-3 ml-1" variant="success" type="submit">
                  Save
                </Button>
              </>
            )}
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
