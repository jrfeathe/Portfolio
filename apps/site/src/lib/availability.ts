import availabilityData from "../../data/availability/weekly.json";
import { Temporal } from "@js-temporal/polyfill";

import type { Locale } from "../utils/i18n";

export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type QuarterHourKey = "0" | "15" | "30" | "45";
export type HourKey = string;

export type QuarterHourMap = Record<QuarterHourKey, boolean>;
export type AvailabilityDay = Record<HourKey, QuarterHourMap>;
export type AvailabilityMatrix = Record<Weekday, AvailabilityDay>;

export type VisibleWindow = {
  start: string;
  end: string;
};

export type AvailabilityData = {
  timezone: string;
  intervalMinutes: number;
  visibleWindow?: VisibleWindow;
  days: Partial<Record<Weekday, Partial<AvailabilityDay>>>;
};

export type DaySummary = {
  day: Weekday;
  ranges: Array<{ start: string; end: string }>;
};

export const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const QUARTER_STRINGS: QuarterHourKey[] = ["0", "15", "30", "45"];
export const INTERVAL_MINUTES = availabilityData.intervalMinutes || 15;
export const QUARTERS_PER_DAY = (60 / INTERVAL_MINUTES) * 24;

const baseAvailability: AvailabilityData = availabilityData;

export function getAvailabilityData(): AvailabilityData {
  return baseAvailability;
}

function createEmptyDay(): AvailabilityDay {
  const day: AvailabilityDay = {};
  for (let hour = 0; hour < 24; hour += 1) {
    const hourKey = hour.toString().padStart(2, "0");
    day[hourKey] = createQuarterMap();
  }
  return day;
}

function createQuarterMap(): QuarterHourMap {
  return QUARTER_STRINGS.reduce(
    (acc, quarter) => {
      acc[quarter] = false;
      return acc;
    },
    {} as QuarterHourMap
  );
}

function createEmptyMatrix(): AvailabilityMatrix {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = createEmptyDay();
    return acc;
  }, {} as AvailabilityMatrix);
}

export function buildAvailabilityMatrix(data: AvailabilityData = baseAvailability): AvailabilityMatrix {
  const matrix = createEmptyMatrix();

  WEEKDAYS.forEach((day) => {
    const sourceDay = data.days[day];
    if (!sourceDay) {
      return;
    }

    Object.entries(sourceDay).forEach(([hourKey, quarterMap]) => {
      if (!matrix[day][hourKey]) {
        matrix[day][hourKey] = createQuarterMap();
      }
      QUARTER_STRINGS.forEach((quarter) => {
        matrix[day][hourKey][quarter] = Boolean(quarterMap?.[quarter]);
      });
    });
  });

  return matrix;
}

function getReferenceWeekStart(
  timezone: string,
  reference?: Temporal.ZonedDateTime | Temporal.Instant | string
) {
  try {
    let zonedReference: Temporal.ZonedDateTime | null = null;
    if (reference) {
      if (typeof reference === "string") {
        zonedReference = Temporal.ZonedDateTime.from(reference).withTimeZone(timezone);
      } else if (reference instanceof Temporal.ZonedDateTime) {
        zonedReference = reference.withTimeZone(timezone);
      } else if (reference instanceof Temporal.Instant) {
        zonedReference = reference.toZonedDateTimeISO(timezone);
      }
    }
    if (!zonedReference) {
      zonedReference = Temporal.Now.zonedDateTimeISO(timezone);
    }
    const daysToSubtract = zonedReference.dayOfWeek % 7;
    if (daysToSubtract) {
      zonedReference = zonedReference.subtract({ days: daysToSubtract });
    }
    return zonedReference.with({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      microsecond: 0,
      nanosecond: 0
    });
  } catch {
    const fallback = Temporal.ZonedDateTime.from(`2025-01-05T00:00:00[${timezone}]`);
    return fallback;
  }
}

function toQuarterKey(minute: number): QuarterHourKey | null {
  if (minute === 0) {
    return "0";
  }
  if (minute === 15) {
    return "15";
  }
  if (minute === 30) {
    return "30";
  }
  if (minute === 45) {
    return "45";
  }
  return null;
}

type ConvertOptions = {
  reference?: Temporal.ZonedDateTime | Temporal.Instant | string;
};

export function convertAvailabilityMatrix(
  data: AvailabilityData,
  targetTimezone: string,
  options?: ConvertOptions
): AvailabilityMatrix {
  if (targetTimezone === data.timezone) {
    return buildAvailabilityMatrix(data);
  }

  const sourceMatrix = buildAvailabilityMatrix(data);
  const converted = createEmptyMatrix();
  const referenceStart = getReferenceWeekStart(data.timezone, options?.reference);

  WEEKDAYS.forEach((day, dayIndex) => {
    Object.entries(sourceMatrix[day]).forEach(([hourKey, quarterMap]) => {
      const hour = Number(hourKey);
      QUARTER_STRINGS.forEach((quarter) => {
          if (!quarterMap[quarter]) {
            return;
          }

          const minute = Number(quarter);
          const block = referenceStart
            .add({ days: dayIndex })
            .with({
              hour,
              minute,
              second: 0,
              millisecond: 0,
              microsecond: 0,
              nanosecond: 0
            });
          const target = block.withTimeZone(targetTimezone);
          const targetDayIndex = target.dayOfWeek % 7;
          const targetDay = WEEKDAYS[targetDayIndex];
          const targetHour = target.hour.toString().padStart(2, "0");
          const targetMinuteKey = toQuarterKey(target.minute);
          if (!targetMinuteKey) {
            return;
          }
          converted[targetDay][targetHour][targetMinuteKey] = true;
      });
    });
  });

  return converted;
}

export function summarizeAvailability(matrix: AvailabilityMatrix): DaySummary[] {
  return WEEKDAYS.map((day) => {
    const ranges: Array<{ start: string; end: string }> = [];
    let currentStart: number | null = null;

    for (let quarterIndex = 0; quarterIndex < QUARTERS_PER_DAY; quarterIndex += 1) {
      const hour = Math.floor(quarterIndex / (60 / INTERVAL_MINUTES));
      const minute = quarterIndex * INTERVAL_MINUTES - hour * 60;
      const hourKey = hour.toString().padStart(2, "0");
      const minuteKey = toQuarterKey(minute);
      const isAvailable = minuteKey ? matrix[day][hourKey][minuteKey] : false;

      if (isAvailable && currentStart === null) {
        currentStart = quarterIndex;
      } else if (!isAvailable && currentStart !== null) {
        ranges.push({
          start: formatQuarterIndex(currentStart),
          end: formatQuarterIndex(quarterIndex)
        });
        currentStart = null;
      }
    }

    if (currentStart !== null) {
      ranges.push({
        start: formatQuarterIndex(currentStart),
        end: formatQuarterIndex(QUARTERS_PER_DAY)
      });
    }

    return { day, ranges };
  });
}

function formatQuarterIndex(index: number) {
  const totalMinutes = index * INTERVAL_MINUTES;
  const hour = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minute = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}

export function parseTimeToMinutes(value: string): number {
  const [hour, minute] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return 0;
  }
  return hour * 60 + minute;
}

export function getVisibleQuarterIndices(data: AvailabilityData = baseAvailability): number[] {
  const window = data.visibleWindow;
  if (!window) {
    return Array.from({ length: QUARTERS_PER_DAY }, (_, index) => index);
  }

  const startMinutes = parseTimeToMinutes(window.start);
  const endMinutes = parseTimeToMinutes(window.end);
  const interval = INTERVAL_MINUTES;
  const startIndex = Math.floor(startMinutes / interval);
  const endIndex = Math.floor(endMinutes / interval);

  if (startMinutes === endMinutes) {
    return Array.from({ length: QUARTERS_PER_DAY }, (_, index) => index);
  }

  if (startMinutes < endMinutes) {
    return Array.from(
      { length: endIndex - startIndex },
      (_, index) => startIndex + index
    );
  }

  const firstSegment = Array.from(
    { length: QUARTERS_PER_DAY - startIndex },
    (_, index) => startIndex + index
  );
  const secondSegment = Array.from({ length: endIndex }, (_, index) => index);

  return [...firstSegment, ...secondSegment];
}

export function formatTimeRange(start: string, end: string) {
  return `${start} – ${end}`;
}

export function formatVisibleWindowLabel(data: AvailabilityData = baseAvailability) {
  const window = data.visibleWindow;
  if (!window) {
    return null;
  }
  return formatTimeRange(window.start, window.end);
}

export function getLocaleDefaultTimezone(locale: Locale) {
  switch (locale) {
    case "ja":
      return "Asia/Tokyo";
    case "zh":
      return "Asia/Shanghai";
    default:
      return baseAvailability.timezone;
  }
}

export function getTimezoneOptions(useFallbackOnly = false): string[] {
  if (!useFallbackOnly && typeof Intl.supportedValuesOf === "function") {
    try {
      return [...Intl.supportedValuesOf("timeZone")];
    } catch {
      return [...fallbackTimezones];
    }
  }
  return [...fallbackTimezones];
}

const fallbackTimezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney"
];

export function getOffsetLabel(timezone: string) {
  const instant = Temporal.Now.instant();
  const tz = Temporal.TimeZone.from(timezone);
  const offsetNanoseconds = tz.getOffsetNanosecondsFor(instant);
  const totalMinutes = offsetNanoseconds / 60_000_000_000;
  const sign = totalMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor(absMinutes % 60)
    .toString()
    .padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
}
