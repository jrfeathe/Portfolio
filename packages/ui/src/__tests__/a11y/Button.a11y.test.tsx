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

  it("renders an accessible anchor when href is provided", async () => {
    const { container, getByRole } = render(
      <Button href="/resume.pdf" download>
        Download resume
      </Button>
    );
    const link = getByRole("link", { name: "Download resume" });
    expect(link).toHaveAttribute("href", "/resume.pdf");
    expect(link).toHaveAttribute("download");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
