import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

const meta = {
  title: "common/BottomSheet",
  component: BottomSheet,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    isOpen: false,
    children: null,
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex h-screen items-center justify-center">
        <Button onClick={() => setOpen(true)}>바텀시트 열기</Button>
        <BottomSheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="기본 바텀시트"
        >
          <div className="flex flex-col gap-4 px-6 pt-2">
            <h2 className="text-body-1-sb text-gray-800">기본 바텀시트</h2>
            <p className="text-body-2-r text-gray-600">
              오버레이를 클릭하거나 아래로 드래그하면 닫힙니다.
            </p>
            <Button onClick={() => setOpen(false)}>닫기</Button>
          </div>
        </BottomSheet>
      </div>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex h-screen items-center justify-center">
        <Button onClick={() => setOpen(true)}>긴 컨텐츠 열기</Button>
        <BottomSheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="긴 컨텐츠"
        >
          <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto px-6 pt-2">
            <h2 className="text-body-1-sb text-gray-800">긴 컨텐츠</h2>
            {Array.from({ length: 20 }).map((_, i) => (
              <p key={i} className="text-body-2-r text-gray-600">
                {i + 1}. 스크롤되는 본문 라인입니다.
              </p>
            ))}
          </div>
        </BottomSheet>
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
        <BottomSheet
          isOpen={open}
          onClose={() => setOpen(false)}
          title="기본 열림"
        >
          <div className="flex flex-col gap-4 px-6 pt-2">
            <h2 className="text-body-1-sb text-gray-800">기본 열림</h2>
            <Button variant="outline" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </div>
        </BottomSheet>
      </div>
    );
  },
};
