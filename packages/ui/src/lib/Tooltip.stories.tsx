import { Button } from "./Button";
import { Tooltip } from "./Tooltip";

export default {
  title: "Components/Tooltip",
  component: Tooltip
};

export const Basic = {
  render: () => (
    <Tooltip content="Copies the portfolio URL to your clipboard">
      <Button variant="ghost">Copy link</Button>
    </Tooltip>
  )
};
