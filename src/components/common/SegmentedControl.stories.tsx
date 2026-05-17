import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";

const meta = {
  title: "common/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    value: undefined,
    onChange: () => {},
    options: [],
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const plainOptions: SegmentedOption<"daily" | "weekly" | "monthly">[] = [
  { value: "daily", label: "일간" },
  { value: "weekly", label: "주간" },
  { value: "monthly", label: "월간" },
];

const stackedOptions: SegmentedOption<"solo" | "team">[] = [
  { value: "solo", label: "개인", description: "혼자 진행" },
  { value: "team", label: "팀", description: "함께 진행" },
];

export const Plain: Story = {
  render: () => {
    const [value, setValue] = useState<"daily" | "weekly" | "monthly">("daily");
    return (
      <div className="w-[360px]">
        <SegmentedControl
          value={value}
          onChange={setValue}
          options={plainOptions}
        />
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState<"daily" | "weekly" | "monthly">("weekly");
    return (
      <div className="w-[360px]">
        <SegmentedControl
          label="조회 기간"
          value={value}
          onChange={setValue}
          options={plainOptions}
        />
      </div>
    );
  },
};

export const Stacked: Story = {
  render: () => {
    const [value, setValue] = useState<"solo" | "team">("solo");
    return (
      <div className="w-[360px]">
        <SegmentedControl
          label="루프 타입"
          value={value}
          onChange={setValue}
          options={stackedOptions}
        />
      </div>
    );
  },
};

export const Unselected: Story = {
  render: () => {
    const [value, setValue] = useState<"daily" | "weekly" | "monthly" | undefined>(
      undefined,
    );
    return (
      <div className="w-[360px]">
        <SegmentedControl
          value={value}
          onChange={setValue}
          options={plainOptions}
        />
      </div>
    );
  },
};
