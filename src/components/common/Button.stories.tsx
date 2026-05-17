import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bell } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "common/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "icon"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Ghost" } };

export const Disabled: Story = { args: { disabled: true } };

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Bell className="h-4 w-4" />
        알림
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    variant: "icon",
    "aria-label": "알림",
    children: <Bell className="h-6 w-6" />,
  },
};

export const VariantMatrix: Story = {
  parameters: { layout: "padded" },
  render: () => {
    const variants = ["primary", "secondary", "outline", "ghost"] as const;
    const sizes = ["sm", "md", "lg"] as const;
    return (
      <div className="flex flex-col gap-6">
        {variants.map((variant) => (
          <div key={variant} className="flex items-center gap-3">
            <span className="w-20 text-caption-r text-gray-500">{variant}</span>
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size}
              </Button>
            ))}
            <Button variant={variant} disabled>
              disabled
            </Button>
          </div>
        ))}
      </div>
    );
  },
};
