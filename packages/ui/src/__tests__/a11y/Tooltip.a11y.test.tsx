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

  it("honors prefers-reduced-motion by disabling transitions", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));

    const { getByRole } = render(
      <Tooltip content="Explain the metric" open>
        <button type="button">Trend insight</button>
      </Tooltip>
    );

    const tooltip = getByRole("tooltip");
    expect(tooltip).toHaveClass("transition-none");

    window.matchMedia = originalMatchMedia;
  });
});
