import { PrimaryButton } from "@/components/common/PrimaryButton";

type AddLoopButtonProps = {
  onClick?: () => void;
};

export function AddLoopButton({ onClick }: AddLoopButtonProps) {
  return (
    <PrimaryButton variant="secondary" onClick={onClick}>
      루프 추가하기
    </PrimaryButton>
  );
}


