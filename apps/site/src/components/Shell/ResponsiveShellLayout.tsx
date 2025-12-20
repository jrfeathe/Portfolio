import { MobileShellLayout } from "./MobileShellLayout";
import { ShellLayout, type ShellLayoutProps } from "./Layout";
import { ShellLayoutSwitcher } from "./ShellLayoutSwitcher";
import { DEFAULT_MOBILE_BREAKPOINT } from "./constants";

export type ResponsiveShellLayoutProps = ShellLayoutProps & {
  mobileBreakpoint?: number;
  mobileSections?: ShellLayoutProps["sections"];
};

export function ResponsiveShellLayout({
  mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT,
  mobileSections,
  ...shellLayoutProps
}: ResponsiveShellLayoutProps) {
  const { sections, ...layoutProps } = shellLayoutProps;
  return (
    <ShellLayoutSwitcher
      desktop={<ShellLayout {...shellLayoutProps} />}
      mobile={
        <MobileShellLayout
          {...layoutProps}
          sections={mobileSections ?? sections}
        />
      }
      mobileBreakpoint={mobileBreakpoint}
    />
  );
}
