import {
  buildAvailabilityMatrix,
  convertAvailabilityMatrix,
  formatVisibleWindowLabel,
  getVisibleQuarterIndices,
  summarizeAvailability,
  type AvailabilityData
} from "../availability";

const fixture: AvailabilityData = {
  timezone: "America/New_York",
  intervalMinutes: 15,
  hiddenHours: ["00", "01", "02", "03", "04", "05", "06", "07"],
  days: {
    sun: {
      "23": { "0": false, "15": false, "30": false, "45": true }
    },
    mon: {
      "09": { "0": true, "15": true, "30": true, "45": true },
      "10": { "0": true, "15": true, "30": true, "45": true }
    }
  }
};

describe("availability helpers", () => {
  it("converts availability with per-day DST bias (day-of change uses post-change offset)", () => {
    const dstFixture: AvailabilityData = {
      timezone: "America/New_York",
      intervalMinutes: 15,
      days: {
        sun: { "15": { "0": true, "15": false, "30": false, "45": false } } // 3:00 PM ET on DST start day
      }
    };

    const converted = convertAvailabilityMatrix(dstFixture, "Asia/Tokyo", {
      reference: "2025-03-09T00:00:00[America/New_York]" // DST starts this day
    });

    // Bias to post-change offset: 15:00 ET (UTC-4) -> 04:00 Monday in Tokyo.
    expect(converted.mon["04"]["0"]).toBe(true);
  });

  it("converts availability into the requested timezone with DST awareness", () => {
    const converted = convertAvailabilityMatrix(fixture, "Asia/Tokyo", {
      reference: "2025-03-09T00:00:00[America/New_York]"
    });

    // 23:45 Sunday America/New_York should map to Monday 12:45 in Tokyo (DST aware).
    expect(converted.mon["12"]["45"]).toBe(true);
  });

  it("provides a consistent visible window even when the range wraps past midnight", () => {
    const indices = getVisibleQuarterIndices(fixture);
    expect(indices[0]).toBe(32); // 08:00
    expect(indices[indices.length - 1]).toBe(95); // 23:45
  });

  it("hides the configured hours after converting to the target timezone", () => {
    const indices = getVisibleQuarterIndices(fixture, {
      timezone: "America/Los_Angeles",
      reference: "2025-01-06T00:00:00[America/New_York]"
    });
    expect(indices[0]).toBe(20); // 05:00 PT (08:00 ET)
    expect(indices[indices.length - 1]).toBe(83); // 20:45 PT (23:45 ET)
  });

  it("summarizes continuous availability ranges", () => {
    const matrix = buildAvailabilityMatrix(fixture);
    const summaries = summarizeAvailability(matrix);
    const monday = summaries.find((summary) => summary.day === "mon");
    expect(monday).toBeDefined();
    expect(monday?.ranges[0]).toEqual({ start: "09:00", end: "11:00" });
  });

  it("returns a formatted label for the visible window", () => {
    expect(formatVisibleWindowLabel(fixture)).toBe("Hidden hours: 00:00 – 08:00");
  });

  it("formats the hidden hours label in the target timezone", () => {
    expect(
      formatVisibleWindowLabel(fixture, {
        timezone: "America/Los_Angeles",
        reference: "2025-01-06T00:00:00[America/New_York]"
      })
    ).toBe("Hidden hours: 00:00 – 05:00, 21:00 – 00:00");
  });

  it("orders wraparound windows from midnight upward", () => {
    const wrapFixture: AvailabilityData = {
      ...fixture,
      hiddenHours: ["01", "02", "03", "04", "05", "06", "07", "08"]
    };
    const indices = getVisibleQuarterIndices(wrapFixture);
    expect(indices[0]).toBe(0); // midnight segment shown first
    expect(indices[indices.length - 1]).toBe(95); // 23:45
  });
});
