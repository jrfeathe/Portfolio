import type { ComponentProps } from "react";
import { Button } from "./Button";

type ButtonStoryProps = ComponentProps<typeof Button>;

export default {
  title: "Components/Button",
  component: Button
};

const Template = (args: ButtonStoryProps) => <Button {...args} />;

export const Primary = {
  render: Template,
  args: {
    children: "Hire Jack",
    variant: "primary"
  }
};

export const Secondary = {
  render: Template,
  args: {
    children: "Preview resume",
    variant: "secondary"
  }
};

export const Ghost = {
  render: Template,
  args: {
    children: "View details",
    variant: "ghost"
  }
};
