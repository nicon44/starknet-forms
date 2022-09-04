import {
  useStarknet,
  useStarknetCall,
  useStarknetInvoke,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import RcTooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";
import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import {
  FaCheck,
  FaClipboardList,
  FaEdit,
  FaShareAlt,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useFormContract } from "../hooks/useFormContract";
import responseToString from "../utils/responseToString";
import CloseModal from "./CloseModal";
import "./MyForms.css";
import ResultsModal from "./ResultsModal";
import ShareModal from "./ShareModal";
import Loader from "./utils/Loader";

interface FormRow {
  id: number;
  name: string;
  status: string;
}

const MyForms = () => {
  const { contract: test } = useFormContract();
  const { account } = useStarknet();

  const [myForms, setMyForms] = useState<FormRow[]>([]);
  const [shareModalId, setShareModalId] = useState<number | null>(null);
  const [closeModalId, setCloseModalId] = useState<number | null>(null);
  const [resultsModalId, setResultsModalId] = useState<number | null>(null);

  const { data: myFormsResult } = useStarknetCall({
    contract: test,
    method: "view_my_forms",
    args: [account],
    options: { watch: true },
  });

  const { invoke: invokeSetReady } = useStarknetInvoke({
    contract: test,
    method: "forms_change_status_ready",
  });

  const navigate = useNavigate();

  const { transactions } = useStarknetTransactionManager();

  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true)

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

  useMemo(() => {
    if (myFormsResult && myFormsResult.length > 0) {
      setLoading(false)
      if (myFormsResult[0] instanceof Array) {
        const resultMap = myFormsResult[0].map((item) => {
          return {
            id: +item.id,
            name: responseToString(item.name),
            status: responseToString(item.status),
          };
        });
        setMyForms(resultMap);
        return;
      }
    }
  }, [myFormsResult]);

  const readyHandler = (id: number) => () => {
    const payload = {
      args: [id],
    };
    invokeSetReady(payload).catch((e) => {
      alert("There was an error in the transaction");
    });
  };

  const closeHandler = (id: number) => () => {
    setCloseModalId(id);
  };

  const showShareModal = (id: number) => () => {
    setShareModalId(id);
  };

  const viewResultsHandler = (id: number) => () => {
    setResultsModalId(id);
  };

  const editHandler = (id: number) => () => {
    navigate("/edit-form/" + id);
  };

  if (loading) {
    return <Loader size={45} />
  }

  return (
    <>
      <h3>My forms</h3>
      {myForms.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>id</th>
              <th>Name</th>
              <th>Status</th>
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
                    {item.status.toUpperCase() === "OPEN" && (
                      <>
                        <RcTooltip
                          placement="bottom"
                          overlay={<span>Set form {item.id} to READY</span>}
                        >
                          <Button
                            className="mr-1 action"
                            variant="success"
                            onClick={readyHandler(item.id)}
                          >
                            <FaCheck />
                          </Button>
                        </RcTooltip>
                        <RcTooltip
                          placement="bottom"
                          overlay={<span>Edit form {item.id}</span>}
                        >
                          <Button
                            className="mr-1 action"
                            variant="secondary"
                            onClick={editHandler(item.id)}
                          >
                            <FaEdit />
                          </Button>
                        </RcTooltip>
                      </>
                    )}
                    {item.status.toUpperCase() === "READY" && (
                      <>
                        <RcTooltip
                          placement="bottom"
                          overlay={<span>Close form {item.id}</span>}
                        >
                          <Button
                            className="mr-1 action"
                            variant="danger"
                            onClick={closeHandler(item.id)}
                          >
                            <FaTimes />
                          </Button>
                        </RcTooltip>

                        <RcTooltip
                          placement="bottom"
                          overlay={<span>Share form {item.id}</span>}
                        >
                          <Button
                            className="mr-1 action"
                            onClick={showShareModal(item.id)}
                          >
                            <FaShareAlt />
                          </Button>
                        </RcTooltip>
                      </>
                    )}
                    {item.status.toUpperCase() === "CLOSED" && (
                      <RcTooltip
                        placement="bottom"
                        overlay={<span>View results of form {item.id}</span>}
                      >
                        <Button
                          className="mr-1 action"
                          variant="info"
                          onClick={viewResultsHandler(item.id)}
                        >
                          <FaClipboardList />
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
          No forms found. Go to 'Create form' to create one.
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
      {myForms.length > 0 && (
        <>
          <h5 className="mt-5">Reference</h5>
          <p>
            A form in state{" "}
            <span className="badge rounded-pill OPEN">OPEN</span> can be edited.
            <br />A form in state{" "}
            <span className="badge rounded-pill READY">READY</span> can be
            shared and completed by other users. <br />
            When a form is{" "}
            <span className="badge rounded-pill CLOSED">CLOSED</span> results
            are calculated. <br />
          </p>
        </>
      )}
      <ShareModal
        id={shareModalId}
        show={shareModalId === 0 || !!shareModalId}
        onHide={() => setShareModalId(null)}
      />
      <CloseModal
        id={closeModalId}
        show={closeModalId === 0 || !!closeModalId}
        onHide={() => setCloseModalId(null)}
      />
      <ResultsModal
        id={resultsModalId}
        show={resultsModalId === 0 || !!resultsModalId}
        onHide={() => setResultsModalId(null)}
      />
    </>
  );
};

export default MyForms;
