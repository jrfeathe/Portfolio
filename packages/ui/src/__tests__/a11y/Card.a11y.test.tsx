import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../lib/Card";

describe("Card accessibility", () => {
  it("renders a structured card without violations", async () => {
    const { container } = render(
      <Card aria-label="Project overview">
        <CardHeader>
          <CardTitle>Project Mercury</CardTitle>
          <CardDescription>
            Delivering a resilient recruiting portfolio with measurable proof.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Key outcomes:</p>
          <ul>
            <li>Increased recruiter engagement.</li>
            <li>Improved content skim mode.</li>
          </ul>
        </CardContent>
        <CardFooter>
          <button type="button">View roadmap</button>
        </CardFooter>
      </Card>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
