import { useStarknet, useStarknetCall } from "@starknet-react/core";
import { useMemo, useState } from "react";
import { useFormContract } from "../hooks/useFormContract";
import './Leaderboard.css'
const Leaderboard: React.FC<{ formId: number }> = ({
  formId,
}) => {
  const { contract: test } = useFormContract();

  const { data: leaderboardResult } = useStarknetCall({
    contract: test,
    method: "view_score_test",
    args: [formId],
    options: { watch: true },
  });
  const { account } = useStarknet();

  const [leaderboard, setLeaderboard] = useState<Array<any>>([]);

  useMemo(() => {
    if (leaderboardResult && leaderboardResult.length > 0) {
      let innerLeaderboard = [];
      for (let item of leaderboardResult[0]) {
        innerLeaderboard.push({
          wallet: item['user'] ? "0x" + item['user'].toString(16) : "?",
          score: +item['score']?.toString(10),
        });
      }
      innerLeaderboard.sort((a, b) => b.score - a.score);
      setLeaderboard(innerLeaderboard);
    }
  }, [leaderboardResult]);

  return (
    <table>
      <thead>
        <tr>
          <th>Wallet</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((item) => {
          return  (
            <tr key={item.wallet} className={item.wallet === account ? 'my-wallet' : ''}>
              <td>{item.wallet}</td>
              <td>{item.score}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Leaderboard;
