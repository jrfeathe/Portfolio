import tokens from "./packages/ui/tokens.json" assert { type: "json" };

const { colors, typography, spacing, radius, shadows } = tokens;
const light = colors.light;
const dark = colors.dark;
const print = colors.print;
const contrastPrimary = light.contrastAccent;
const contrastPrimaryDark = dark.contrastAccent;
const contrastOnPrimary = light.contrastOn;
const contrastOnPrimaryDark = dark.contrastOn;
const contrastOnPrimaryStrong = dark.contrastOnStrong ?? contrastOnPrimaryDark;
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
        focus: light.focus,
        attention: attentionSurface,
        contrast: {
          primary: contrastPrimary,
          "primary-dark": contrastPrimaryDark,
          "on-primary": contrastOnPrimary,
          "on-primary-dark": contrastOnPrimaryDark,
          "on-primary-strong": contrastOnPrimaryStrong
        },
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
          focus: dark.focus
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
