import { useStarknetCall } from "@starknet-react/core";
import { useMemo } from "react";
import { toBN } from "starknet/dist/utils/number";
import { useFormContract } from "../hooks/useFormContract";

export function ViewTestCount() {
  const { contract: test } = useFormContract();

  const { data: testResult } = useStarknetCall({
    contract: test,
    method: "view_test_count",
    args: [],
    options: { watch: true },
  });

  const testValue = useMemo(() => {
    if (testResult && testResult.length > 0) {
      const value = toBN(testResult[0]);
      return value.toString(10);
    }
  }, [testResult]);

  return (
    <div>
      <h2>Contract</h2>
      <p>Address: {test?.address}</p>
      <p>view_test_count: {testValue}</p>
      <p></p>
    </div>
  );
}
