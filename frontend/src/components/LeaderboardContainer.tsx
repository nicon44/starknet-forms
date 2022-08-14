import { useState } from "react";
import { useFormContract } from "../hooks/useFormContract";
import FormSelector from "./FormSelector";
import Leaderboard from "./Leaderboard";

const LeaderboardContainer: React.FC = () => {
  const [formId, setFormId] = useState<number | null>(null);
  const { contract: test } = useFormContract();

  const loadForm = (id: number) => {
    setFormId(id);
  };

  return (
    <div>
      <h2>Leaderboard</h2>

      {!formId && formId !== 0 && <FormSelector onSubmit={loadForm} />}
      {(formId || formId === 0) && (
        <Leaderboard formId={formId} />
      )}
    </div>
  );
};

export default LeaderboardContainer;
