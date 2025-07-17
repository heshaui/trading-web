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
            {prefix ? <span>{prefix}</span> : null}
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
