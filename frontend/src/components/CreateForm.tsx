import { useStarknetInvoke } from "@starknet-react/core";
import { useState } from "react";
import { useFormContract } from "../hooks/useFormContract";
import convertCorrectOption from "../utils/convertCorrectOption";
import responseToString from "../utils/responseToString";
import stringToHex from "../utils/stringToHex";

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
  };

  const handleInputChange = (event: any, setFunction: any) => {
    const value = event.target.value;
    setFunction(stringToHex(value));
  };

  const addQuestionHandler = () => {
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
      <h3>Your Form:</h3>
      <label>Name: </label>
      <input
        type="text"
        onChange={(event) => handleInputChange(event, setName)}
      />
      {questions.length === 0 && <p>Add new questions to create a form</p>}
      {questions.length > 0 &&
        questions.map((question) => {
          return (
            <ul key={question.description}>
              <li>Description: {responseToString(question.description)}</li>
              <li>Option A: {responseToString(question.optionA)}</li>
              <li>Option B: {responseToString(question.optionB)}</li>
              <li>Option C: {responseToString(question.optionC)}</li>
              <li>Option D: {responseToString(question.optionD)}</li>
              <li>
                Correct Option: {convertCorrectOption(question.optionCorrect)}
              </li>
            </ul>
          );
        })}
      {questions.length > 0 && (
        <button onClick={handleSubmit} type="submit">
          SEND
        </button>
      )}
      <br />
      <h4>Add new question:</h4>
      <form id="form">
        <label>Description: </label>
        <input
          type="text"
          onChange={(event) => handleInputChange(event, setDescription)}
        />{" "}
        <br />
        <label>Option A: </label>
        <input
          type="text"
          onChange={(event) => handleInputChange(event, setOptionA)}
        />{" "}
        <br />
        <label>Option B: </label>
        <input
          type="text"
          onChange={(event) => handleInputChange(event, setOptionB)}
        />{" "}
        <br />
        <label>Option C: </label>
        <input
          type="text"
          onChange={(event) => handleInputChange(event, setOptionC)}
        />{" "}
        <br />
        <label>Option D: </label>
        <input
          type="text"
          onChange={(event) => handleInputChange(event, setOptionD)}
        />{" "}
        <br /> <br />
        <label>Correct Option:</label> <br />
        <input
          type="radio"
          value="0"
          name="correctOption"
          onChange={handleRadioChange}
        />
        <label htmlFor="0">A</label>
        <br />
        <input
          type="radio"
          value="1"
          name="correctOption"
          onChange={handleRadioChange}
        />
        <label htmlFor="1">B</label>
        <br />
        <input
          type="radio"
          value="2"
          name="correctOption"
          onChange={handleRadioChange}
        />
        <label htmlFor="2">C</label>
        <br />
        <input
          type="radio"
          value="3"
          name="correctOption"
          onChange={handleRadioChange}
        />
        <label htmlFor="3">D</label>
        <br /> <br />
        <button onClick={addQuestionHandler} type="button">
          Add question
        </button>
        <br />
      </form>
      <ul>
        <li>Data: {data}</li>
        <li>Loading: {loading}</li>
        <li>Error: {error}</li>
      </ul>
    </>
  );
};

export default CreateForm;
