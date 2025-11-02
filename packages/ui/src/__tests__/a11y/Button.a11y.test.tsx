import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import { Button } from "../../lib/Button";

describe("Button accessibility", () => {
  it("has no detectable accessibility violations", async () => {
    const { container, getByRole } = render(
      <Button>Submit application</Button>
    );
    const button = getByRole("button", { name: "Submit application" });
    expect(button).toHaveClass("focus-visible:ring-4");
    expect(button).toHaveClass("focus-visible:ring-focus");
    expect(button).toHaveClass("motion-reduce:transition-none");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
