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
  visibleWindow: { start: "08:00", end: "00:00" },
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

  it("summarizes continuous availability ranges", () => {
    const matrix = buildAvailabilityMatrix(fixture);
    const summaries = summarizeAvailability(matrix);
    const monday = summaries.find((summary) => summary.day === "mon");
    expect(monday).toBeDefined();
    expect(monday?.ranges[0]).toEqual({ start: "09:00", end: "11:00" });
  });

  it("returns a formatted label for the visible window", () => {
    expect(formatVisibleWindowLabel(fixture)).toBe("08:00 – 00:00");
  });
});
