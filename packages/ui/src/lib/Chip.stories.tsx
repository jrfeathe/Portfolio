import type { ComponentProps } from "react";
import { Chip } from "./Chip";

type ChipStoryProps = ComponentProps<typeof Chip>;

export default {
  title: "Components/Chip",
  component: Chip
};

const Template = (args: ChipStoryProps) => <Chip {...args} />;

export const Neutral = {
  render: Template,
  args: {
    children: "Remote friendly",
    variant: "neutral"
  }
};

export const Accent = {
  render: Template,
  args: {
    children: "Case study",
    variant: "accent"
  }
};

export const Outline = {
  render: Template,
  args: {
    children: "TypeScript",
    variant: "outline"
  }
};
