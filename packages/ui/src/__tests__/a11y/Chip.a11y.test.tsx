import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import { Chip } from "../../lib/Chip";

describe("Chip accessibility", () => {
  it("supports accessible usage across variants", async () => {
    const { container, rerender } = render(
      <Chip leadingIcon={<span aria-hidden>*</span>} trailingIcon={<span aria-hidden>{">"}</span>}>
        Featured work
      </Chip>
    );
    expect(await axe(container)).toHaveNoViolations();

    rerender(
      <Chip as="button" variant="accent">
        Primary action
      </Chip>
    );
    const interactiveChip = container.querySelector("button");
    expect(interactiveChip).not.toBeNull();
    expect(interactiveChip!).toHaveClass("focus-visible:ring-4");
    expect(interactiveChip!).toHaveClass("focus-visible:ring-focus");
    expect(await axe(container)).toHaveNoViolations();
  });
});
