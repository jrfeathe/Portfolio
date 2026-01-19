import tokens from "./packages/ui/tokens.json" assert { type: "json" };

const { colors, typography, spacing, radius, shadows } = tokens;
const print = colors.print;
const printDivider = print.divider;
const withAlpha = (name) => `rgb(var(--${name}-rgb) / <alpha-value>)`;
const lightVar = (token) => withAlpha(`light-${token}`);
const darkVar = (token) => withAlpha(`dark-${token}`);
const lightHcVar = (token) => withAlpha(`light-hc-${token}`);
const darkHcVar = (token) => withAlpha(`dark-hc-${token}`);

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
        background: lightVar("background"),
        surface: lightVar("surface"),
        surfaceMuted: lightVar("surfaceMuted"),
        border: lightVar("border"),
        text: lightVar("text"),
        textMuted: lightVar("textMuted"),
        accent: lightVar("accent"),
        accentHover: lightVar("accentHover"),
        accentOn: lightVar("accentOn"),
        danger: lightVar("danger"),
        focus: lightHcVar("accent"),
        attention: lightVar("attention"),
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
          background: darkVar("background"),
          surface: darkVar("surface"),
          surfaceMuted: darkVar("surfaceMuted"),
          border: darkVar("border"),
          text: darkVar("text"),
          textMuted: darkVar("textMuted"),
          accent: darkVar("accent"),
          accentHover: darkVar("accentHover"),
          accentOn: darkVar("accentOn"),
          danger: darkVar("danger"),
          focus: darkHcVar("accent")
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
