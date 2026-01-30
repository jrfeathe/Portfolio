import { act, render, screen } from "@testing-library/react";

import { buildSkimToggleUrl, setSkimMode, useSkimMode } from "../skim-mode";

const SkimProbe = () => {
  const skimMode = useSkimMode();
  return <span data-testid="skim-mode">{skimMode ? "on" : "off"}</span>;
};

describe("skim-mode (client)", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "http://localhost/");
    document.documentElement.dataset.skimMode = "";
    document.documentElement.style.overflowAnchor = "";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("builds toggle urls from the current location", () => {
    window.history.replaceState({}, "", "/notes?sort=asc#section");
    expect(buildSkimToggleUrl(false, "/fallback")).toBe(
      "/notes?sort=asc&skim=1#section"
    );

    window.history.replaceState({}, "", "/notes?skim=1#section");
    expect(buildSkimToggleUrl(true, "/fallback")).toBe("/notes#section");
  });

  it("updates history state and dispatches toggle events", () => {
    jest.useFakeTimers();
    const pushSpy = jest.spyOn(window.history, "pushState");
    const replaceSpy = jest.spyOn(window.history, "replaceState");
    const clearSpy = jest.spyOn(window, "clearTimeout");
    const listener = jest.fn();
    window.addEventListener("portfolio:skim-mode", listener);

    act(() => {
      setSkimMode(true);
    });

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(window.location.search).toContain("skim=1");
    expect(document.documentElement.dataset.skimMode).toBe("true");
    expect(document.documentElement.style.overflowAnchor).toBe("none");
    expect(listener).toHaveBeenCalledTimes(1);

    act(() => {
      setSkimMode(false, { replace: true });
    });

    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(clearSpy).toHaveBeenCalled();
    expect(window.location.search).not.toContain("skim=1");
    expect(document.documentElement.dataset.skimMode).toBe("false");

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(document.documentElement.style.overflowAnchor).toBe("");

    window.removeEventListener("portfolio:skim-mode", listener);
    jest.useRealTimers();
  });

  it("reports skim mode changes through the hook", () => {
    jest.useFakeTimers();
    render(<SkimProbe />);

    expect(screen.getByTestId("skim-mode")).toHaveTextContent("off");

    act(() => {
      setSkimMode(true);
    });

    expect(screen.getByTestId("skim-mode")).toHaveTextContent("on");

    act(() => {
      setSkimMode(false);
    });

    expect(screen.getByTestId("skim-mode")).toHaveTextContent("off");

    act(() => {
      jest.runOnlyPendingTimers();
    });

    jest.useRealTimers();
  });
});
