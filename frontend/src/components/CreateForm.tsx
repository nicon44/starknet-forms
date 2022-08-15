import { useStarknetInvoke } from "@starknet-react/core";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { hash } from "starknet";
import { useFormContract } from "../hooks/useFormContract";
import convertCorrectOption from "../utils/convertCorrectOption";
import stringToHex from "../utils/stringToHex";
import "./CreateForm.css";

const CreateForm = () => {
  const { contract: test } = useFormContract();
  const { invoke: invokeCreateAndAdd } = useStarknetInvoke({
    contract: test,
    method: "create_form_add_questions",
  });

  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionCorrect, setOptionCorrect] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [readySwitch, setReadySwitch] = useState(true);

  const [questions, setQuestions] = useState<Array<any>>([]);

  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  const navigate = useNavigate();

  const handleRadioChange = (event: any) => {
    const value = event.target.value;
    setOptionCorrect(+value);
  };

  const handleSwitchChange = (event: any) => {
    const value = event.target.checked;
    setReadySwitch(value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const payload = {
      args: [
        stringToHex(name),
        hexQuestions(),
        readySwitch ? 0 : 1,
        hash.pedersen([stringToHex(secret), 0]),
      ],
    };

    invokeCreateAndAdd(payload)
      .then(() => {
        navigate("/my-forms");
      })
      .catch((e) => {
        alert("There was an error in the transaction. Please try again");
        console.log("error", e);
      });
  };

  const hexQuestions = () => {
    const questionsCopy = [...questions];
    return questionsCopy.map((question) => {
      return {
        description: stringToHex(question.description),
        optionA: stringToHex(question.optionA),
        optionB: stringToHex(question.optionB),
        optionC: stringToHex(question.optionC),
        optionD: stringToHex(question.optionD),
        option_correct_hash: getOptionCorrectHash(question),
      };
    });
  };

  const getOptionCorrectHash = (question: any) => {
    let correctOption;
    switch (question.optionCorrect) {
      case 0:
        correctOption = stringToHex(question.optionA);
        break;
        case 1:
        correctOption = stringToHex(question.optionB);
        break;
        case 2:
        correctOption = stringToHex(question.optionC);
        break;
        case 3:
        correctOption = stringToHex(question.optionD);
        break;
    }
    return hash.pedersen([correctOption, stringToHex(secret)]);
  };

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
        const newQuestions = [...prevQuestions];
        newQuestions[editingId!] = newQuestion;
        return newQuestions;
      });
      setEditingId(undefined);
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
    return !!editingId || editingId === 0;
  };

  return (
    <>
      <Row>
        <Col md="8">
          <h4>Your form:</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(event) => handleInputChange(event, setName)}
            />

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
            <Form.Label>Secret *</Form.Label>
            <Form.Control
              type="text"
              required
              onChange={(event) => handleInputChange(event, setSecret)}
            />
            <Form.Text className="text-muted">
              Please enter a password to sign your form. You will need this to
              update or close the form later. Do not forget it!
            </Form.Text>
            <Form.Check
              className="mt-3"
              type="switch"
              label="Set form to READY"
              checked={readySwitch}
              onChange={handleSwitchChange}
            />
            <Form.Text className="text-muted">
              {readySwitch
                ? "This form will be set to READY. This means you will not be able to update it and other users will be able to complete it right away."
                : "This form will stay OPEN. This means you will be able to update it later."}
            </Form.Text>
            {questions.length === 0 && (
              <p className="mt-5">
                You need to add questions to create a form.
              </p>
            )}
            <div className="mt-3">
              <Button disabled={questions.length === 0} type="submit">
                CREATE FORM
              </Button>
            </div>
          </Form>
        </Col>
        <Col md="4">
          {!editing() && <h4>Add new question</h4>}
          {editing() && <h4>Edit question {editingId! + 1}</h4>}
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
    </>
  );
};

export default CreateForm;
