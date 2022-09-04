import { useStarknetCall } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useFormContract } from "../hooks/useFormContract";
import IQuestion from "../model/question";
import { getFormQuestions } from "../starknet/getFormQuestions";
import Loader from "./utils/Loader";

const CompleteForm = (props: {
  id: number;
  onSubmit: (nickname: string, result: string[]) => void;
}) => {
  const { contract: test } = useFormContract();

  const { data: formResult } = useStarknetCall({
    contract: test,
    method: "view_questions",
    args: [props.id],
    options: { watch: false },
  });

  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [form, setForm] = useState<IQuestion[]>([]);

  useEffect(() => {
    if (loading && formResult && formResult.length > 0) {
      getFormQuestions(formResult).then((response) => {
        setForm(response);
        setLoading(false);
      });
    }
  }, [formResult, loading]);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const result = form.map((item: IQuestion) => {
      return item.selectedOption!.toString();
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

  const handleNameChange = (event: any) => {
    setNickname(event.target.value);
  };

  if (loading) {
    return <Loader size={45} />;
  }

  return (
    <div>
      <h2>Form {props.id}</h2>
      <Form onSubmit={handleSubmit}>
        {form && form.length > 0 && (
          <>
            <Form.Label>Your name *</Form.Label>
            <Form.Control type="text" required onChange={handleNameChange} />
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
