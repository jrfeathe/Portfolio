import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import { StatTile } from "../../lib/StatTile";

describe("StatTile accessibility", () => {
  it("announces metrics without violations", async () => {
    const { container } = render(
      <StatTile
        label="Offer acceptance"
        value="92%"
        description="Acceptance rate across strategic roles this year."
        trend={{ direction: "up", label: "up 6 points vs last year" }}
        footer={<span>Updated weekly</span>}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
