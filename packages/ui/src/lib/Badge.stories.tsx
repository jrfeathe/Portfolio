import type { ComponentProps } from "react";
import { Badge } from "./Badge";

type BadgeStoryProps = ComponentProps<typeof Badge>;

export default {
  title: "Components/Badge",
  component: Badge
};

const Template = (args: BadgeStoryProps) => <Badge {...args} />;

export const Neutral = {
  render: Template,
  args: {
    children: "In review",
    variant: "neutral"
  }
};

export const Accent = {
  render: Template,
  args: {
    children: "Featured",
    variant: "accent"
  }
};

export const Danger = {
  render: Template,
  args: {
    children: "Blocked",
    variant: "danger"
  }
};
