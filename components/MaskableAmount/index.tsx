const MaskableAmount = ({ show, amount }: { show: boolean, amount: number }) => {
  return (
    <span>
      {show ? amount : "****"}
    </span>
  );
};

export default MaskableAmount;