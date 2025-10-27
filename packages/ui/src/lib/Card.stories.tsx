import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";

export default {
  title: "Components/Card",
  component: Card
};

export const WithMetadata = {
  render: () => (
    <Card>
      <CardHeader>
        <Badge variant="accent">Live</Badge>
        <CardTitle>Trade-off Explorer</CardTitle>
        <CardDescription>
          Interactive tool that helps product leaders weigh scenario outcomes in
          under five minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Built a decision intelligence engine that aggregates telemetry,
          financial signals, and operational constraints to help executives make
          repeatable choices.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="secondary">Read the case study</Button>
        <Button variant="ghost">View metrics</Button>
      </CardFooter>
    </Card>
  )
};
