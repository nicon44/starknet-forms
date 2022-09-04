import { useStarknet, useStarknetCall } from "@starknet-react/core";
import { useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import { useFormContract } from "../hooks/useFormContract";
import getScore from "../utils/getScore";
import responseToString from "../utils/responseToString";
import './Leaderboard.css'
const Leaderboard: React.FC<{ formId: number }> = ({
  formId,
}) => {
  const { contract: test } = useFormContract();

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
        const account = item['user'].toString(16);
        innerLeaderboard.push({
          nickname: responseToString(item.nickname),
          wallet: "0x..." + account.slice(account.length - 6),
          score: getScore(+item["correct_count"]?.toString(10), +item["incorrect_count"]?.toString(10)),
        });
      }
      innerLeaderboard.sort((a, b) => b.score - a.score);
      setLeaderboard(innerLeaderboard);
    }
  }, [leaderboardResult]);

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
          return  (
            <tr key={item.wallet} className={item.wallet === account ? 'my-wallet' : ''}>
              <td>{item.nickname}</td>
              <td>{item.wallet}</td>
              <td>{item.score}%</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default Leaderboard;
