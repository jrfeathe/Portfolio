import { resolveServicesAvailability, servicesAvailability } from "../servicesAvailability";

const baseConfig = JSON.parse(JSON.stringify(servicesAvailability));

const restoreConfig = () => {
  Object.assign(servicesAvailability, JSON.parse(JSON.stringify(baseConfig)));
};

describe("services availability utilities", () => {
  beforeEach(() => {
    restoreConfig();
  });

  it("keeps defaults before the vacation window", () => {
    const result = resolveServicesAvailability(new Date(2026, 1, 10));

    expect(result.isVacationActive).toBe(false);
    expect(result.bannerMessage).toBeUndefined();
    expect(result.services).toEqual({
      quickFix: { status: "open" },
      deployment: { status: "open", waitlistCount: 0 },
      maintenance: { status: "waitlist", waitlistCount: 0 }
    });
  });

  it("defaults to the current date when no argument is provided", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 1, 10));

    try {
      const result = resolveServicesAvailability();

      expect(result.isVacationActive).toBe(false);
      expect(result.bannerMessage).toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });

  it("shows the banner during the vacation window", () => {
    const result = resolveServicesAvailability(new Date(2026, 2, 18));

    expect(result.isVacationActive).toBe(true);
    expect(result.bannerMessage).toBe(servicesAvailability.banner?.message);
    expect(result.services.quickFix.status).toBe("open");
    expect(result.services.deployment.status).toBe("open");
    expect(result.services.maintenance.status).toBe("waitlist");
  });

  it("closes all services when configured", () => {
    servicesAvailability.vacationWindow = {
      ...servicesAvailability.vacationWindow!,
      closeAllServices: true
    };

    const result = resolveServicesAvailability(new Date(2026, 2, 20));

    expect(result.isVacationActive).toBe(true);
    expect(result.services.quickFix.status).toBe("closed");
    expect(result.services.deployment.status).toBe("closed");
    expect(result.services.maintenance.status).toBe("closed");
  });

  it("shows the banner when showWhenActiveOnly is disabled", () => {
    servicesAvailability.banner = {
      ...servicesAvailability.banner!,
      showWhenActiveOnly: false
    };

    const result = resolveServicesAvailability(new Date(2026, 4, 1));

    expect(result.isVacationActive).toBe(false);
    expect(result.bannerMessage).toBe(servicesAvailability.banner?.message);
  });

  it("handles missing banner and vacation configuration", () => {
    servicesAvailability.banner = undefined;
    servicesAvailability.vacationWindow = undefined;

    const result = resolveServicesAvailability(new Date(2026, 1, 10));

    expect(result.isVacationActive).toBe(false);
    expect(result.bannerMessage).toBeUndefined();
  });

  it("treats invalid vacation window dates as inactive", () => {
    servicesAvailability.vacationWindow = {
      from: "invalid",
      to: "2026-00-10",
      closeAllServices: false
    };

    const result = resolveServicesAvailability(new Date(2026, 2, 20));

    expect(result.isVacationActive).toBe(false);
  });
});
