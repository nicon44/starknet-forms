import { useStarknetCall, useStarknetInvoke } from "@starknet-react/core";
import { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { hash } from "starknet";
import { BigNumberish, toHex } from "starknet/utils/number";
import { useFormContract } from "../hooks/useFormContract";
import convertCorrectOption from "../utils/convertCorrectOption";
import IpfsUtils from "../utils/IpfsUtils";
import responseToString from "../utils/responseToString";
import stringToHex from "../utils/stringToHex";
import "./CreateForm.css";

const CreateForm: React.FC = () => {

  const ipfsUtils = new IpfsUtils();
  const { id } = useParams();
  const isEditing = !!id;

  const { contract: test } = useFormContract();
  const { invoke: invokeCreateForm } = useStarknetInvoke({
    contract: test,
    method: "create_form",
  });
  const { invoke: invokeUpdateForm } = useStarknetInvoke({
    contract: test,
    method: "updated_form",
  });

  const [description, setDescription] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionCorrect, setOptionCorrect] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [correctSecret, setCorrectSecret] = useState(false);
  const [readySwitch, setReadySwitch] = useState(true);
  const [invalidSecret, setInvalidSecret] = useState(false);

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

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const hexQuestions = await getHexQuestions()
    const payload = isEditing ? {
      args: [
        id,
        stringToHex(name),
        hexQuestions,
        readySwitch ? 0 : 1,
        hash.pedersen([stringToHex(secret), 0]),
      ],
    } : {
      args: [
        stringToHex(name),
        hexQuestions,
        readySwitch ? 0 : 1,
        hash.pedersen([stringToHex(secret), 0]),
      ],
    };

    const invokeFunction = isEditing ? invokeUpdateForm : invokeCreateForm;

    invokeFunction(payload)
      .then(() => {
        navigate("/my-forms");
      })
      .catch((e) => {
        alert("There was an error in the transaction. Please try again");
        console.log("error", e);
      });
  };

  const { data: formResult } = useStarknetCall({
    contract: test,
    method: "view_questions",
    args: [id],
    options: { watch: false },
  });

  const { data: formData } = useStarknetCall({
    contract: test,
    method: "view_form",
    args: [id],
    options: { watch: false },
  });

  useMemo(() => {
    if (formData && formData.length > 0) {
      if (formData[0]) {
        setName(responseToString(formData[0].name))
        return;
      }
    }
  }, [formData]);

  const calculateCorrectOption = (question: any) => {
    const correctOptionHashed: BigNumberish = toHex(
      question.option_correct_hash
    );
    if (
      correctOptionHashed ===
      hash.pedersen([toHex(question.optionA), stringToHex(secret)])
    ) {
      return 0;
    } else if (
      correctOptionHashed ===
      hash.pedersen([toHex(question.optionB), stringToHex(secret)])
    ) {
      return 1;
    } else if (
      correctOptionHashed ===
      hash.pedersen([toHex(question.optionC), stringToHex(secret)])
    ) {
      return 2;
    } else if (
      correctOptionHashed ===
      hash.pedersen([toHex(question.optionD), stringToHex(secret)])
    ) {
      return 3;
    } else {
      return 99;
    }
  };

  useMemo(() => {
    if (formResult && formResult.length > 0) {
      let form = [];
      if (formResult[0] instanceof Array) {
        for (let item of formResult[0]) {
          let question: any = {
            id: responseToString(item.description),
            description: responseToString(item.description),
            optionA: responseToString(item.optionA),
            optionB: responseToString(item.optionB),
            optionC: responseToString(item.optionC),
            optionD: responseToString(item.optionD),
            optionCorrect: calculateCorrectOption(item),
          };
          form.push(question);
        }
      }
      setQuestions(form);
      return form;
    }
  }, [formResult, secret]);

  const handleSecretSubmit = (event: any) => {
    setInvalidSecret(false);
    event.preventDefault();
    if (questions[0].optionCorrect >= 0 && questions[0].optionCorrect <= 3) {
      setCorrectSecret(true);
    } else {
      setInvalidSecret(true);
    }
  };

  const getHexQuestions = async () => {
    const questionsCopy = [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const uploadedDescription = await ipfsUtils.upload(question.description)
      const uploadedOptionA = await ipfsUtils.upload(question.optionA)
      const uploadedOptionB = await ipfsUtils.upload(question.optionB)
      const uploadedOptionC = await ipfsUtils.upload(question.optionC)
      const uploadedOptionD = await ipfsUtils.upload(question.optionD)

      const newQuestion = {
        description: ipfsUtils.getSplitObject(uploadedDescription),
        optionA: ipfsUtils.getSplitObject(uploadedOptionA),
        optionB: ipfsUtils.getSplitObject(uploadedOptionB),
        optionC: ipfsUtils.getSplitObject(uploadedOptionC),
        optionD: ipfsUtils.getSplitObject(uploadedOptionD),
        option_correct_hash: getOptionCorrectHash(question.optionCorrect, [uploadedOptionA, uploadedOptionB, uploadedOptionC, uploadedOptionD]),
      };
      questionsCopy.push(newQuestion)
    }
    return questionsCopy
  };

  const getOptionCorrectHash = (optionCorrect: number, uploadedOptions: string[]) => {
    const correctOptionSplit = ipfsUtils.getSplitObject(uploadedOptions[optionCorrect])
    const correctOptionHash = hash.pedersen([correctOptionSplit.high, correctOptionSplit.low])
    return hash.pedersen([correctOptionHash, stringToHex(secret)]);
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

  if (isEditing && !correctSecret) {
    return (
      <>
        <Form onSubmit={handleSecretSubmit}>
          <Form.Label>Secret *</Form.Label>
          <Form.Control
            type="text"
            required
            isInvalid={invalidSecret}
            onChange={(event) => handleInputChange(event, setSecret)}
          />
          {invalidSecret && (
            <Form.Control.Feedback type="invalid">
              The inserted secret is invalid.
            </Form.Control.Feedback>
          )}
          <Form.Text className="text-muted">
            Please enter your secret to edit the form.
          </Form.Text>
          <div className="mt-3">
            <Button type="submit">CONTINUE</Button>
          </div>
        </Form>
      </>
    );
  }

  return (
    <>
      <Row>
        <Col md="7">
          {isEditing ? <h4>Editing form {id}:</h4> : <h4>Your form:</h4>}
          <Form onSubmit={handleSubmit}>
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              required
              value={name}
              onChange={(event) => handleInputChange(event, setName)}
            />

            {questions.length > 0 &&
              questions.map((question, index) => {
                return (
                  <div key={question.description}>
                    <Form.Label>
                      <span className="bold">Question {index + 1}</span>
                      <span onClick={editHandler(index)} className="icon">
                        <FaEdit />
                      </span>
                      <span onClick={deleteHandler(index)} className="icon">
                        <FaTrashAlt />
                      </span>
                    </Form.Label>
                    <ul key={question.description}>
                      <li className="mb-3"><span className="bold">Description:</span> {question.description}</li>
                      <li className="mb-3"><span className="bold">Option A:</span> {question.optionA}</li>
                      <li className="mb-3"><span className="bold">Option B:</span> {question.optionB}</li>
                      <li className="mb-3"><span className="bold">Option C:</span> {question.optionC}</li>
                      <li className="mb-3"><span className="bold">Option D:</span> {question.optionD}</li>
                      <li>
                        <span className="bold">Correct Option:</span>{" "}
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
              disabled={isEditing}
              value={secret}
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
                ? "This form will be set to READY. You will not be able to update it and other users will be able to complete it right away."
                : "This form will stay OPEN. You will be able to update it later."}
            </Form.Text>
            {questions.length === 0 && (
              <p className="mt-5">
                You need to add questions to create a form.
              </p>
            )}
            <div className="mt-3">
              {isEditing ? (
                <Button variant="success" disabled={questions.length === 0} type="submit">
                  UPDATE FORM
                </Button>
              ) : (
                <Button disabled={questions.length === 0} type="submit">
                  CREATE FORM
                </Button>
              )}
            </div>
          </Form>
        </Col>
        <Col md="5">
          {!editing() && <h4>Add new question</h4>}
          {editing() && <h4>Edit question {editingId! + 1}</h4>}
          <Form id="form" onSubmit={addQuestionHandler}>
            <Form.Label>Description: </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              required
              value={description}
              onChange={(event) => handleInputChange(event, setDescription)}
            />
            <Form.Label>Option A: </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              required
              value={optionA}
              onChange={(event) => handleInputChange(event, setOptionA)}
            />
            <Form.Label>Option B: </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              required
              value={optionB}
              onChange={(event) => handleInputChange(event, setOptionB)}
            />
            <Form.Label>Option C: </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              required
              value={optionC}
              onChange={(event) => handleInputChange(event, setOptionC)}
            />
            <Form.Label>Option D: </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
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
