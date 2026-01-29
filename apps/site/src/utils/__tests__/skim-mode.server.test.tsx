/**
 * @jest-environment node
 */

jest.mock("react", () => {
  const actual = jest.requireActual<typeof import("react")>("react");

  return {
    __esModule: true,
    ...actual,
    useSyncExternalStore: (
      subscribe: (callback: () => void) => () => void,
      getSnapshot: () => boolean,
      getServerSnapshot: () => boolean
    ) => {
      const unsubscribe = subscribe(() => undefined);
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
      getSnapshot();
      return getServerSnapshot();
    }
  };
});

import { renderToString } from "react-dom/server";

import { buildSkimToggleUrl, setSkimMode, useSkimMode } from "../skim-mode";

const SkimProbe = () => {
  const skimMode = useSkimMode();
  return <span>{skimMode ? "on" : "off"}</span>;
};

describe("skim-mode (server)", () => {
  it("returns the server snapshot and skips browser mutations", () => {
    expect(renderToString(<SkimProbe />)).toContain("off");
    expect(() => setSkimMode(true)).not.toThrow();
  });

  it("builds toggle urls from fallback inputs", () => {
    expect(buildSkimToggleUrl(false, "/fallback")).toBe("/fallback?skim=1");
    expect(buildSkimToggleUrl(true, "/fallback", "?skim=1")).toBe("/fallback");
    expect(buildSkimToggleUrl(false, "/fallback", "?foo=1")).toBe(
      "/fallback?foo=1&skim=1"
    );
  });
});
