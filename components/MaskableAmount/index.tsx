const MaskableAmount = ({
  show,
  content,
}: {
  show: boolean;
  content: React.ReactNode;
}) => {
  return (
    <>
      {show ? content : "****"}
    </>
  );
};

export default MaskableAmount;
