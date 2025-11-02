import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "../../lib/Accordion";

describe("Accordion accessibility", () => {
  it("provides toggleable regions without violations", async () => {
    const { container, rerender } = render(
      <Accordion defaultValue="mission">
        <AccordionItem value="mission">
          <AccordionTrigger value="mission">Mission</AccordionTrigger>
          <AccordionContent value="mission">
            <p>Initial scope and alignment notes.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="roadmap">
          <AccordionTrigger value="roadmap">Roadmap</AccordionTrigger>
          <AccordionContent value="roadmap">
            <p>Sequential deliverables for the release.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(await axe(container)).toHaveNoViolations();

    rerender(
      <Accordion type="multiple" defaultValue={["mission", "roadmap"]}>
        <AccordionItem value="mission">
          <AccordionTrigger value="mission">Mission</AccordionTrigger>
          <AccordionContent value="mission">
            <p>Initial scope and alignment notes.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="roadmap">
          <AccordionTrigger value="roadmap">Roadmap</AccordionTrigger>
          <AccordionContent value="roadmap">
            <p>Sequential deliverables for the release.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
