import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "./Accordion";

export default {
  title: "Components/Accordion",
  component: Accordion
};

export const Single = {
  render: () => (
    <Accordion defaultValue="outcome" collapsible>
      <AccordionItem value="outcome">
        <AccordionTrigger value="outcome">
          Outcomes
        </AccordionTrigger>
        <AccordionContent value="outcome">
          Delivered recruiter-facing case studies with linked telemetry that
          highlight shipping velocity and risk mitigation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="constraints">
        <AccordionTrigger value="constraints">
          Constraints
        </AccordionTrigger>
        <AccordionContent value="constraints">
          Zero net-new SaaS spend and no external network access during
          development.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="followup">
        <AccordionTrigger value="followup">
          Follow-up
        </AccordionTrigger>
        <AccordionContent value="followup">
          Invite stakeholders to the weekly showcase to see new artifacts in
          motion.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
};

export const Multiple = {
  render: () => (
    <Accordion defaultValue={["principles"]} type="multiple">
      <AccordionItem value="principles">
        <AccordionTrigger value="principles">
          Guiding principles
        </AccordionTrigger>
        <AccordionContent value="principles">
          Accessibility-first, lighthouse monitored, and localization-ready from
          day one.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="coverage">
        <AccordionTrigger value="coverage">
          Coverage
        </AccordionTrigger>
        <AccordionContent value="coverage">
          Storybook-driven with Playwright and Jest coverage thresholds tracked
          via CI quality gates.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
};
