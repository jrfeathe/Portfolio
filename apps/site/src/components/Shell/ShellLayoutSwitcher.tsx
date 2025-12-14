"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { DEFAULT_MOBILE_BREAKPOINT } from "./constants";

type ShellLayoutSwitcherProps = {
  desktop: ReactNode;
  mobile: ReactNode;
  mobileBreakpoint?: number;
};

export function ShellLayoutSwitcher({
  desktop,
  mobile,
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT
}: ShellLayoutSwitcherProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);

    return () => {
      window.removeEventListener("resize", updateIsMobile);
    };
  }, [mobileBreakpoint]);

  return isMobile ? mobile : desktop;
}
