import { IconButton } from "../IconButton";

type HeaderEditButtonProps = {
  onClick?: () => void;
};

export default function HeaderEditButton({
  onClick,
}: HeaderEditButtonProps) {
  return (
    <IconButton
      src="/header/header_edit.svg"
      alt="수정"
      onClick={onClick}
    />
  );
}