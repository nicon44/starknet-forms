import { TailSpin } from "react-loader-spinner";

const Loader = ({size = 25}) => {
  return (
    <TailSpin
      height={size}
      width={size}
      radius="9"
      color="black"
      ariaLabel="loading"
    />
  );
};

export default Loader