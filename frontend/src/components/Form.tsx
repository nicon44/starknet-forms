import { useStarknetCall } from "@starknet-react/core";
import { useMemo, useState } from "react";
import { useFormContract } from "../hooks/useFormContract";
import IQuestion from "../model/question";
import responseToString from "../utils/responseToString";

const Form = (props: { id: number; onSubmit: (result: string) => void }) => {
  const { contract: test } = useFormContract();

  const { data: formResult } = useStarknetCall({
    contract: test,
    method: "view_questions",
    args: [props.id],
    options: { watch: false },
  });

  const [form, setForm] = useState<any>();

  useMemo(() => {
    if (formResult && formResult.length > 0) {
      let form = [];
      if (formResult[0] instanceof Array) {
        for (let item of formResult[0]) {
          let question: IQuestion = {
            id: responseToString(item.description),
            description: responseToString(item.description),
            optionA: responseToString(item.optionA),
            optionB: responseToString(item.optionB),
            optionC: responseToString(item.optionC),
            optionD: responseToString(item.optionD),
            selectedOption: undefined,
          };
          form.push(question);
        }
      }
      setForm(form);
      return form;
    }
  }, [formResult]);

  const handleSubmit = () => {
    const result = form.map((item: IQuestion) => {
      return item.selectedOption;
    });
    props.onSubmit(result);
  };

  const handleChange = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    setForm((prevState: any) => {
      prevState.find((item: IQuestion) => {
        return item.id === name;
      }).selectedOption = value;
      return prevState;
    });
  };

  return (
    <div>
      <h2>Form {props.id}</h2>

      {form && form.length > 0 ? (
        form?.map((question: IQuestion) => {
          return (
            <div key={question.description}>
              <h2>{question.description}</h2>
              <input
                type="radio"
                value={0}
                name={question.id}
                onChange={handleChange}
              />
              <label htmlFor={question.optionA}>{question.optionA}</label>
              <br />
              <input
                type="radio"
                value={1}
                name={question.id}
                onChange={handleChange}
              />
              <label htmlFor={question.optionB}>{question.optionB}</label>
              <br />
              <input
                type="radio"
                value={2}
                name={question.id}
                onChange={handleChange}
              />
              <label htmlFor={question.optionC}>{question.optionC}</label>
              <br />
              <input
                type="radio"
                value={3}
                name={question.id}
                onChange={handleChange}
              />
              <label htmlFor={question.optionD}>{question.optionD}</label>
            </div>
          );
        })
      ) : (
        <p>No questions found</p>
      )}
      <br />
      <button onClick={handleSubmit}>SUBMIT</button>
    </div>
  );
};

export default Form;
