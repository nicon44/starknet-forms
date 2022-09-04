import {
  useStarknet,
  useStarknetCall,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import RcTooltip from "rc-tooltip";
import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { FaRegListAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useFormContract } from "../hooks/useFormContract";
import responseToString from "../utils/responseToString";
import "./MyForms.css";
import Loader from "./utils/Loader";

interface FormRow {
  id: number;
  name: string;
  score: number;
  status: string;
}

const MyResults = () => {
  const { contract: test } = useFormContract();
  const { account } = useStarknet();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true)

  const [myForms, setMyForms] = useState<FormRow[]>([]);

  const { data: myFormsResult } = useStarknetCall({
    contract: test,
    method: "view_my_score_forms_completed",
    args: [account],
    options: { watch: true },
  });

  const { transactions } = useStarknetTransactionManager();

  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);

  useEffect(() => {
    setPendingTransactions(
      transactions.filter(
        (item: any) =>
          item.transaction &&
          item.transaction.type === "INVOKE_FUNCTION" &&
          item.status &&
          item.status !== "ACCEPTED_ON_L1" &&
          item.status !== "ACCEPTED_ON_L2" &&
          item.status !== "REJECTED"
      )
    );
  }, [transactions]);
  
  const getScore = (correct: number, incorrect: number) => {
    return (correct / (correct + incorrect)) * 100
  }

  useMemo(() => {
    if (myFormsResult && myFormsResult.length > 0) {
      setLoading(false)
      if (myFormsResult[0] instanceof Array) {
        const resultMap = myFormsResult[0].map((item) => {
          return {
            id: +item.id_form,
            name: responseToString(item.name),
            score: getScore(+item["correct_count"]?.toString(10), +item["incorrect_count"]?.toString(10)),
            status: responseToString(item.status),
          };
        });
        setMyForms(resultMap);
        return;
      }
    }
  }, [myFormsResult]);

  const viewDetailsHandler = (id: number) => () => {
    navigate("/score-details/" + id);
  };

  if (loading) {
    return <Loader size={45} />
  }

  return (
    <>
      <h3>My Results</h3>
      {myForms.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>id</th>
              <th>Form name</th>
              <th>Form status</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {myForms.map((item) => {
              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <span
                      className={
                        "badge rounded-pill " + item.status.toUpperCase()
                      }
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {item.status.toUpperCase() === "CLOSED"
                      ? item.score + '%'
                      : "Form not closed"}
                  </td>
                  <td>
                    {item.status.toUpperCase() === "CLOSED" && (
                      <RcTooltip
                        placement="bottom"
                        overlay={<span>Score details of form {item.id}</span>}
                      >
                        <Button
                          className="mr-1 action"
                          onClick={viewDetailsHandler(item.id)}
                        >
                          <FaRegListAlt />
                        </Button>
                      </RcTooltip>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <p className="mt-3">
          No results found. Go to 'Complete form' to complete one.
        </p>
      )}
      {pendingTransactions.length > 0 && (
        <h4 className="mt-3">Pending transactions</h4>
      )}
      {pendingTransactions.map((transaction) => {
        return (
          <p key={transaction.transactionHash}>
            There is an unfinished transaction with status {transaction.status}
          </p>
        );
      })}
      {pendingTransactions.length > 0 && <Loader />}
    </>
  );
};

export default MyResults;
