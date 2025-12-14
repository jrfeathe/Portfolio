import { MobileShellLayout } from "./MobileShellLayout";
import { ShellLayout, type ShellLayoutProps } from "./Layout";
import { ShellLayoutSwitcher } from "./ShellLayoutSwitcher";
import { DEFAULT_MOBILE_BREAKPOINT } from "./constants";

export type ResponsiveShellLayoutProps = ShellLayoutProps & {
  mobileBreakpoint?: number;
};

export function ResponsiveShellLayout({
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  ...shellLayoutProps
}: ResponsiveShellLayoutProps) {
  return (
    <ShellLayoutSwitcher
      desktop={<ShellLayout {...shellLayoutProps} />}
      mobile={<MobileShellLayout {...shellLayoutProps} />}
      mobileBreakpoint={mobileBreakpoint}
    />
  );
}
