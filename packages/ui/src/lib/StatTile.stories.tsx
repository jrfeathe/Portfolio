import { StatTile } from "./StatTile";
import { Tooltip } from "./Tooltip";

export default {
  title: "Components/StatTile",
  component: StatTile
};

export const WithTrend = {
  render: () => (
    <StatTile
      label="Lead time"
      value="2.4 days"
      trend={{ direction: "up", label: "+18% faster" }}
      description="Measured across the last 90 days of recruiter service requests."
      footer={
        <Tooltip content="Aggregated from Jira cycle-time dashboards and release logs">
          <span className="underline decoration-dotted underline-offset-2">
            View data sources
          </span>
        </Tooltip>
      }
    />
  )
};

export const Neutral = {
  render: () => (
    <StatTile
      label="Availability"
      value="99.95%"
      trend={{ direction: "neutral", label: "SLA steady" }}
      description="No major incidents in the last 12 months."
    />
  )
};
