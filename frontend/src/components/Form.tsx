import { useStarknetCall } from "@starknet-react/core";
import { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useFormContract } from "../hooks/useFormContract";
import IQuestion from "../model/question";
import IpfsUtils from "../utils/IpfsUtils";
import responseToString from "../utils/responseToString";

const CompleteForm = (props: {
  id: number;
  onSubmit: (nickname: string, result: string) => void;
}) => {
  const ipfsUtils = new IpfsUtils();
  const { contract: test } = useFormContract();

  const { data: formResult } = useStarknetCall({
    contract: test,
    method: "view_questions",
    args: [props.id],
    options: { watch: false },
  });

  const [form, setForm] = useState<any>();
  const [nickname, setNickname] = useState('')

  const getFromIpfs = async (item: any) => {
    const response = await ipfsUtils.download(responseToString(item.high)+responseToString(item.low))
    return response;
  }

  useMemo(async () => {
    if (formResult && formResult.length > 0) {
      let form = [];
      if (formResult[0] instanceof Array) {
        for (let item of formResult[0]) {
          const description = await getFromIpfs(item.description)
          const optionA = await getFromIpfs(item.optionA)
          const optionB = await getFromIpfs(item.optionB)
          const optionC = await getFromIpfs(item.optionC)
          const optionD = await getFromIpfs(item.optionD)
          let question: IQuestion = {
            id: description,
            description: description,
            optionA: optionA,
            optionB: optionB,
            optionC: optionC,
            optionD: optionD,
            selectedOption: undefined,
          };
          form.push(question);
        }
      }
      setForm(form);
      return form;
    }
  }, [formResult]);


  const handleSubmit = (event: any) => {
    event.preventDefault();
    const result = form.map((item: IQuestion) => {
      return item.selectedOption;
    });
    props.onSubmit(nickname, result);
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

  const handleNameChange = (event:any) => {
    setNickname(event.target.value)
  }

  return (
    <div>
      <h2>Form {props.id}</h2>
      <Form onSubmit={handleSubmit}>
        {form && form.length > 0 && (
          <>
            <Form.Label>Your name *</Form.Label>
            <Form.Control
              type="text"
              required
              onChange={handleNameChange}
            />
          </>
        )}
        {form && form.length > 0 ? (
          form?.map((question: IQuestion) => {
            return (
              <div key={question.description}>
                <h3 className="mt-3">{question.description}</h3>
                <Form.Check
                  label={question.optionA}
                  type="radio"
                  value={0}
                  name={question.id}
                  onChange={handleChange}
                />
                <Form.Check
                  label={question.optionB}
                  type="radio"
                  value={1}
                  name={question.id}
                  onChange={handleChange}
                />
                <Form.Check
                  label={question.optionC}
                  type="radio"
                  value={2}
                  name={question.id}
                  onChange={handleChange}
                />
                <Form.Check
                  label={question.optionD}
                  type="radio"
                  value={3}
                  name={question.id}
                  onChange={handleChange}
                />
              </div>
            );
          })
        ) : (
          <>
            <p>
              Form with id {props.id} was not found. Are you sure you inserted
              the correct id?
            </p>
            <Link to="/">
              <Button>Go Back</Button>
            </Link>
          </>
        )}
        {form && form.length > 0 && (
          <Button className="mt-3" type="submit">
            SUBMIT
          </Button>
        )}
      </Form>
    </div>
  );
};

export default CompleteForm;
