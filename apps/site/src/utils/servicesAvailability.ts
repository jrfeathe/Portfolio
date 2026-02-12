export type ServiceKey = "quickFix" | "deployment" | "maintenance";
export type ServiceStatus = "open" | "waitlist" | "closed";

export type ServiceAvailability = {
  status: ServiceStatus;
  waitlistCount?: number;
};

export type ServicesAvailabilityConfig = {
  quickFix: ServiceAvailability;
  deployment: ServiceAvailability;
  maintenance: ServiceAvailability;
  banner?: {
    message: string;
    showWhenActiveOnly?: boolean;
  };
  vacationWindow?: {
    from: string;
    to: string;
    closeAllServices?: boolean;
  };
};

export type ResolvedServicesAvailability = {
  services: Record<ServiceKey, ServiceAvailability>;
  isVacationActive: boolean;
  bannerMessage?: string;
};

export const servicesAvailability: ServicesAvailabilityConfig = {
  quickFix: { status: "open" },
  deployment: { status: "open", waitlistCount: 0 },
  maintenance: { status: "waitlist", waitlistCount: 0 },
  banner: {
    message:
      "I'm traveling March 18-April 9, 2026 and may respond slowly. If you email, include your URL + urgency + deadline.",
    showWhenActiveOnly: true
  },
  vacationWindow: {
    from: "2026-03-17",
    to: "2026-04-10",
    closeAllServices: false
  }
};

function parseLocalDate(value: string, endOfDay: boolean) {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3) {
    return null;
  }
  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return null;
  }
  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day);
}

function isWithinVacationWindow(
  now: Date,
  window: ServicesAvailabilityConfig["vacationWindow"]
) {
  if (!window) {
    return false;
  }
  const from = parseLocalDate(window.from, false);
  const to = parseLocalDate(window.to, true);
  if (!from || !to) {
    return false;
  }
  return now >= from && now <= to;
}

export function resolveServicesAvailability(
  now: Date = new Date()
): ResolvedServicesAvailability {
  const isVacationActive = isWithinVacationWindow(now, servicesAvailability.vacationWindow);
  const closeAllServices =
    isVacationActive && Boolean(servicesAvailability.vacationWindow?.closeAllServices);
  const services: Record<ServiceKey, ServiceAvailability> = {
    quickFix: { ...servicesAvailability.quickFix },
    deployment: { ...servicesAvailability.deployment },
    maintenance: { ...servicesAvailability.maintenance }
  };

  if (closeAllServices) {
    services.quickFix.status = "closed";
    services.deployment.status = "closed";
    services.maintenance.status = "closed";
  }

  const bannerMessage = servicesAvailability.banner?.message;
  const showWhenActiveOnly = servicesAvailability.banner?.showWhenActiveOnly ?? true;
  const resolvedBannerMessage =
    bannerMessage && (isVacationActive || !showWhenActiveOnly)
      ? bannerMessage
      : undefined;

  return {
    services,
    isVacationActive,
    bannerMessage: resolvedBannerMessage
  };
}
