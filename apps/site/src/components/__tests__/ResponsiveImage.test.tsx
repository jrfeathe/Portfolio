/* eslint-disable @next/next/no-img-element */
import { render, screen } from "@testing-library/react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: Record<string, unknown>) => {
    const {
      priority,
      fill,
      blurDataURL,
      placeholder,
      ...rest
    } = props as Record<string, unknown>;

    void priority;
    void fill;
    void blurDataURL;
    void placeholder;

    // eslint-disable-next-line jsx-a11y/alt-text
    return (
      <img
        alt={typeof alt === "string" ? alt : ""}
        data-mocked-image
        {...rest}
      />
    );
  }
}));

import { ResponsiveImage } from "../ResponsiveImage";

describe("ResponsiveImage", () => {
  it("renders with the correct sizes hint for hero presets", () => {
    render(
      <ResponsiveImage
        image={{
          src: "/media/hero/hero-glow.svg",
          alt: "Hero visual",
          width: 960,
          height: 720
        }}
        preset="hero"
      />
    );

    const image = screen.getByRole("img", { name: "Hero visual" });

    expect(image).toHaveAttribute("sizes", expect.stringContaining("100vw"));
    expect(image).toHaveClass("rounded-xl");
  });
});
