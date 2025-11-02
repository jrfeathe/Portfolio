import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import { Button } from "../../lib/Button";

describe("Button accessibility", () => {
  it("has no detectable accessibility violations", async () => {
    const { container } = render(<Button>Submit application</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
