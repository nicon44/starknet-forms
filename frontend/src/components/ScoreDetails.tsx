import { useStarknet, useStarknetCall } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormContract } from "../hooks/useFormContract";
import IQuestion from "../model/question";
import { getFormQuestions } from "../starknet/getFormQuestions";
import Loader from "./utils/Loader";
import "./ScoreDetails.css";
import { FaCheck, FaTimes } from "react-icons/fa";

const OPTIONS = ["A", "B", "C", "D"];

const ScoreDetails: React.FC = () => {
  const { id, wallet } = useParams();
  const { contract: test } = useFormContract();
  const { account } = useStarknet();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<IQuestion[]>([]);
  const [fullForm, setFullForm] = useState<IQuestion[]>([]);

  const { data: formResult } = useStarknetCall({
    contract: test,
    method: "view_questions",
    args: [id],
    options: { watch: false },
  });

  useEffect(() => {
    if (formResult && formResult.length > 0) {
      if (!form || form.length === 0) {
        getFormQuestions(formResult).then((response) => {
          setForm(response);
        });
      }
    }
  }, [formResult]);

  const { data: userAnswers } = useStarknetCall({
    contract: test,
    method: "view_users_form_answers",
    args: [+id!, wallet ? wallet : account],
    options: { watch: false },
  });

  useEffect(() => {
    if (form && form.length > 0 && userAnswers && userAnswers.length > 0) {
      const answers = userAnswers![0].map(
        (answer: any) => +answer.toString(10)
      );
      const newForm = [...form];
      for (let i = 0; i < newForm.length; i++) {
        const question = newForm[i];
        question.selectedOption = answers[i];
      }
      setFullForm(newForm);
      setLoading(false);
    }
  }, [userAnswers, form]);

  const getScore = () => {
    const totalQuestions = form.length;
    let correctAnswers = 0;
    form.forEach((question) => {
      if (question.correctOption === question.selectedOption) {
        correctAnswers++;
      }
    });
    return {
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
      correctAnswers,
      totalQuestions,
    };
  };

  if (loading) {
    return <Loader size={45} />;
  }

  return (
    <>
      <h2>{wallet ? 'Results for wallet ' + wallet.slice(0, 6) +  '...' + wallet.slice(wallet.length - 6) : 'Your result'}</h2>
      <h3 className="mt-3">
        Score: {getScore().percentage}% ({getScore().correctAnswers}/
        {getScore().totalQuestions})
      </h3>
      {fullForm?.map((question: IQuestion) => {
        return (
          <div key={question.description}>
            <h4 className="mt-4">{question.description}</h4>
            <ol type="A" className="score-details">
              <li
                className={
                  +question.selectedOption! === 0 ? "selected" : "regular"
                }
              >
                {question.optionA}
              </li>
              <li
                className={
                  +question.selectedOption! === 1 ? "selected" : "regular"
                }
              >
                {question.optionB}
              </li>
              <li
                className={
                  +question.selectedOption! === 2 ? "selected" : "regular"
                }
              >
                {question.optionC}
              </li>
              <li
                className={
                  +question.selectedOption! === 3 ? "selected" : "regular"
                }
              >
                {question.optionD}
              </li>
            </ol>
            {question.selectedOption === question.correctOption && (
              <span className="correct">
                <FaCheck /> Correct
              </span>
            )}
            {question.selectedOption !== question.correctOption && (
              <span>
                <span className="incorrect">
                  <FaTimes /> Incorrect
                </span>
                . The correct answer is {OPTIONS[question.correctOption!]}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
};

export default ScoreDetails;
