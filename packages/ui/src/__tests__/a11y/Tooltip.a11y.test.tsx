import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import { Tooltip } from "../../lib/Tooltip";

describe("Tooltip accessibility", () => {
  it("links trigger and content without violations", async () => {
    const { container, rerender } = render(
      <Tooltip content="Explain the metric" open delay={0}>
        <button type="button">Trend insight</button>
      </Tooltip>
    );

    expect(await axe(container)).toHaveNoViolations();

    rerender(
      <Tooltip content="Explain the metric" delay={0}>
        <button type="button">Trend insight</button>
      </Tooltip>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
