const MaskableAmount = ({
  show,
  content,
}: {
  show: boolean;
  content: React.ReactNode;
}) => {
  return (
    <div>
      <span>{show ? content : "****"}</span>
    </div>
  );
};

export default MaskableAmount;
