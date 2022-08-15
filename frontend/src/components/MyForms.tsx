import {
  useStarknet,
  useStarknetCall,
  useStarknetInvoke,
  useStarknetTransactionManager,
} from "@starknet-react/core";
import { useEffect, useMemo, useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import { FaCheck, FaShareAlt, FaTimes } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { useFormContract } from "../hooks/useFormContract";
import responseToString from "../utils/responseToString";
import CloseModal from "./CloseModal";
import "./MyForms.css";
import ShareModal from "./ShareModal";

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

  useMemo(() => {
    if (myFormsResult && myFormsResult.length > 0) {
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
    setCloseModalId(id)
  };

  const showShareModal = (id: number) => () => {
    setShareModalId(id);
  };

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
                    <span className={"badge rounded-pill " + item.status}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.status === "OPEN" && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`tooltip-${item.id}`}>
                            Set form {item.id} to READY
                          </Tooltip>
                        }
                      >
                        <Button
                          className="mr-1 action"
                          variant="success"
                          onClick={readyHandler(item.id)}
                        >
                          <FaCheck />
                        </Button>
                      </OverlayTrigger>
                    )}
                    {item.status === "READY" && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`tooltip-${item.id}`}>
                            Close form {item.id}
                          </Tooltip>
                        }
                      >
                        <Button
                          className="mr-1 action"
                          variant="danger"
                          onClick={closeHandler(item.id)}
                        >
                          <FaTimes />
                        </Button>
                      </OverlayTrigger>
                    )}
                    {item.status === "READY" && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id={`tooltip-${item.id}`}>
                            Share form {item.id}
                          </Tooltip>
                        }
                      >
                        <Button
                          className="mr-1 action"
                          onClick={showShareModal(item.id)}
                        >
                          <FaShareAlt />
                        </Button>
                      </OverlayTrigger>
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
      {pendingTransactions.length > 0 && (
        <TailSpin
          height="25"
          width="25"
          radius="9"
          color="black"
          ariaLabel="loading"
        />
      )}
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
    </>
  );
};

export default MyForms;
