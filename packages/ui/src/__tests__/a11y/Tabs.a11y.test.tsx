import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../lib/Tabs";

describe("Tabs accessibility", () => {
  it("exposes tab controls without violations", async () => {
    const { container } = render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p>Overview content for the selected tab.</p>
        </TabsContent>
        <TabsContent value="details">
          <p>Details content available on demand.</p>
        </TabsContent>
      </Tabs>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
