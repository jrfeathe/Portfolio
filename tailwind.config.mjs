import tokens from "./packages/ui/tokens.json" assert { type: "json" };

const { colors, typography, spacing, radius, shadows } = tokens;
const light = colors.light;
const dark = colors.dark;
const print = colors.print;
const lightHc = colors["light-hc"] || {};
const darkHc = colors["dark-hc"] || {};
const focusLight = lightHc.accent;
const focusDark = darkHc.accent;
const attentionSurface = light.attention;
const printDivider = print.divider;

export default {
  darkMode: "class",
  content: [
    "./apps/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: light.background,
        surface: light.surface,
        surfaceMuted: light.surfaceMuted,
        border: light.border,
        text: light.text,
        textMuted: light.textMuted,
        accent: light.accent,
        accentHover: light.accentHover,
        accentOn: light.accentOn,
        danger: light.danger,
        focus: focusLight,
        attention: attentionSurface,
        print: {
          background: print.background,
          surface: print.surface,
          surfaceMuted: print.surfaceMuted,
          border: print.border,
          divider: printDivider,
          text: print.text,
          textMuted: print.textMuted,
          accent: print.accent,
          accentOn: print.accentOn,
          danger: print.danger,
          focus: print.focus
        },
        dark: {
          background: dark.background,
          surface: dark.surface,
          surfaceMuted: dark.surfaceMuted,
          border: dark.border,
          text: dark.text,
          textMuted: dark.textMuted,
          accent: dark.accent,
          accentHover: dark.accentHover,
          accentOn: dark.accentOn,
          danger: dark.danger,
          focus: focusDark
        }
      },
      fontFamily: {
        sans: typography.fontFamily.sans,
        heading: typography.fontFamily.sans,
        mono: typography.fontFamily.mono
      },
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      spacing,
      borderRadius: radius,
      boxShadow: shadows
    }
  },
  plugins: []
};
