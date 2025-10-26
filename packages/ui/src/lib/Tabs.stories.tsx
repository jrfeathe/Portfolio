import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./Tabs";
import { Card, CardContent } from "./Card";

export default {
  title: "Components/Tabs",
  component: Tabs
};

export const Horizontal = {
  render: () => (
    <Tabs defaultValue="impact">
      <TabsList>
        <TabsTrigger value="impact">Impact</TabsTrigger>
        <TabsTrigger value="approach">Approach</TabsTrigger>
        <TabsTrigger value="evidence">Evidence</TabsTrigger>
      </TabsList>
      <TabsContent value="impact">
        <Card>
          <CardContent>
            Reduced onboarding time by 37% by streamlining deployment
            automation and cross-team enablement.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="approach">
        <Card>
          <CardContent>
            Introduced gradual rollout playbooks, instrumented metrics, and
            documented the operating model for self-serve adoption.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="evidence">
        <Card>
          <CardContent>
            Internal SLAs, DORA dashboards, and recruiter-ready case study
            links.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
};

export const Vertical = {
  render: () => (
    <Tabs defaultValue="summary" orientation="vertical" className="md:flex-row">
      <TabsList className="md:min-w-[12rem]">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
      </TabsList>
      <TabsContent value="summary">
        Shipped within eight weeks with <strong>0 downtime incidents</strong>.
      </TabsContent>
      <TabsContent value="team">
        Led a cross-functional team of six engineers, one designer, and a TPM.
      </TabsContent>
      <TabsContent value="metrics">
        Maintained <strong>99.95%</strong> uptime across three regions.
      </TabsContent>
    </Tabs>
  )
};
