import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

const meta = {
  title: "common/Dialog",
  component: Dialog,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    isOpen: false,
    children: null,
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex h-screen items-center justify-center">
        <Button onClick={() => setOpen(true)}>모달 열기</Button>
        <Dialog isOpen={open} onClose={() => setOpen(false)} title="기본 모달">
          <div className="w-[328px] rounded-[15px] bg-white p-6">
            <h2 className="text-body-1-b text-gray-800">기본 모달</h2>
            <p className="mt-2 text-body-2-r text-gray-600">
              오버레이를 누르거나 ESC로 닫힙니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                닫기
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  },
};

export const OpenByDefault: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="flex h-screen items-center justify-center">
        <Button onClick={() => setOpen(true)}>다시 열기</Button>
        <Dialog isOpen={open} onClose={() => setOpen(false)} title="기본 열림">
          <div className="w-[328px] rounded-[15px] bg-white p-6 text-center">
            <p className="text-body-1-b text-gray-800">기본으로 열린 상태</p>
            <Button
              variant="tonal"
              className="mt-4"
              onClick={() => setOpen(false)}
            >
              닫기
            </Button>
          </div>
        </Dialog>
      </div>
    );
  },
};
