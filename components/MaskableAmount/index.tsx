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
    <div>
      <span>
        {show ? (
          <>
            <span style={{ fontFamily: "DIN", marginRight: "4px" }}>
              {amount || 0}
            </span>
            <span>{unit ? unit : ""}</span>
          </>
        ) : (
          "****"
        )}
      </span>
    </div>
  );
};

export default MaskableAmount;
