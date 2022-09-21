import { useStarknet, useStarknetCall } from "@starknet-react/core";
import RcTooltip from "rc-tooltip";
import { useMemo, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { CSVLink } from "react-csv";
import { FaRegListAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useFormContract } from "../hooks/useFormContract";
import getScore from "../utils/getScore";
import responseToString from "../utils/responseToString";
import "./Leaderboard.css";

const ResultsModal: React.FC<{
  id: number | null;
  onHide: () => void;
  show: boolean;
}> = ({ id: formId, onHide, show }) => {
  const { contract: test } = useFormContract();
  const navigate = useNavigate();

  const { data: leaderboardResult } = useStarknetCall({
    contract: test,
    method: "view_score_form",
    args: [formId],
    options: { watch: true },
  });
  const { account } = useStarknet();

  const [leaderboard, setLeaderboard] = useState<Array<any>>([]);

  useMemo(() => {
    if (leaderboardResult && leaderboardResult.length > 0) {
      let innerLeaderboard = [];
      for (let item of leaderboardResult[0]) {
        const account = item["user"].toString(16);
        innerLeaderboard.push({
          nickname: responseToString(item.nickname),
          wallet: "0x" + account,
          score: getScore(
            +item["correct_count"]?.toString(10),
            +item["incorrect_count"]?.toString(10)
          ),
        });
      }
      setLeaderboard(innerLeaderboard);
    }
  }, [leaderboardResult]);

  const viewDetailsHandler = (wallet: string) => () => {
    navigate("/score-details/" + formId + "/" + wallet);
  };

  const getLeaderboard = () => {
    return (
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Wallet</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((item) => {
            return (
              <tr
                key={item.wallet}
                className={item.wallet === account ? "my-wallet" : ""}
              >
                <td>{item.nickname}</td>
                <td>{item.wallet}</td>
                <td>
                  {item.score}%
                  <RcTooltip
                    placement="bottom"
                    overlay={<span>Score details</span>}
                  >
                    <Button
                      className="ml-1 action"
                      onClick={viewDetailsHandler(item.wallet)}
                    >
                      <FaRegListAlt />
                    </Button>
                  </RcTooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };

  const csvHeaders = [
    { label: "Name", key: "nickname" },
    { label: "Wallet", key: "wallet" },
    { label: "Score", key: "score" },
  ];

  return (
    <Modal
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={show}
      onHide={onHide}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Results of form {formId}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{getLeaderboard()}</Modal.Body>
      <Modal.Footer>
        <CSVLink
          className="btn btn-primary"
          data={leaderboard}
          headers={csvHeaders}
          filename={"scores-form-" + formId + ".csv"}
        >
          Download csv
        </CSVLink>
        <Button onClick={onHide} variant="secondary">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResultsModal;
