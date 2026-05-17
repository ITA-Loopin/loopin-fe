import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button } from "./Button";

const meta = {
  title: "common/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    isOpen: false,
    onClose: () => {},
    onConfirm: () => {},
    title: "",
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex h-screen items-center justify-center">
        <Button onClick={() => setOpen(true)}>확인 모달 열기</Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title="변경사항을 저장할까요?"
          confirmText="저장"
          cancelText="취소"
        />
      </div>
    );
  },
};

export const Danger: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex h-screen items-center justify-center">
        <Button variant="tonal" onClick={() => setOpen(true)}>
          탈퇴 모달 열기
        </Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title={"루핑님, 정말 회원 탈퇴 하시겠어요?"}
          confirmText="탈퇴하기"
          cancelText="취소"
          variant="danger"
        />
      </div>
    );
  },
};

export const MultilineTitle: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex h-screen items-center justify-center">
        <Button onClick={() => setOpen(true)}>다시 열기</Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title={"이 작업은 되돌릴 수 없습니다.\n계속 진행하시겠어요?"}
        />
      </div>
    );
  },
};
