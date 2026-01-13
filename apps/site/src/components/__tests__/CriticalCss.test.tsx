import { render } from "@testing-library/react";

import rawManifest from "../../../app/critical-css.manifest.json";
import { CriticalCss, type CriticalCssManifest } from "../../../app/CriticalCss";

const manifest = rawManifest as CriticalCssManifest;

describe("CriticalCss", () => {
  it("inlines the shared critical CSS payload", () => {
    const { container } = render(<CriticalCss />);
    const styleElement = container.querySelector("style[data-critical-css]");

    expect(styleElement).not.toBeNull();

    const expectedBytes = manifest.shared?.bytes ?? 0;

    expect(styleElement?.getAttribute("data-critical-css")).toBe(
      manifest.shared?.id
    );
    expect(styleElement?.getAttribute("data-critical-bytes")).toBe(
      String(expectedBytes)
    );
    expect(styleElement?.textContent).toBeTruthy();
  });
});
