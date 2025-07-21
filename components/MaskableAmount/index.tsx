const MaskableAmount = ({
  show,
  amount,
  unit,
  prefix,
}: {
  show: boolean;
  amount: number;
  unit?: string;
  prefix?: string;
}) => {
  return (
    <span>
      {show ? `${prefix ? prefix : ""}${amount || 0} ${unit ? unit : ""}` : "****"}
    </span>
  );
};

export default MaskableAmount;
