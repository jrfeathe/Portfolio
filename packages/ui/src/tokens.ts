import tokensData from "../tokens.json" assert { type: "json" };

type ModeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentOn: string;
  danger: string;
  focus?: string;
  borderSubtle?: string;
  primaryRing?: string;
  primaryGlow?: string;
  attention?: string;
  divider?: string;
};

type TypographyTokens = {
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  fontSize: Record<string, string>;
  lineHeight: Record<string, string>;
  fontWeight: Record<string, string>;
  letterSpacing: Record<string, string>;
};

type ColorAliases = Record<string, string>;

type DesignTokens = {
  colors: {
    light: ModeColors;
    dark: ModeColors;
    print: ModeColors;
    "light-hc"?: ModeColors;
    "dark-hc"?: ModeColors;
  };
  colorAliases?: ColorAliases;
  typography: TypographyTokens;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadows: Record<string, string>;
};

const baseTokens = tokensData as DesignTokens;

export const tokens = baseTokens;
export const colors = baseTokens.colors;
export const typography = baseTokens.typography;
export const spacing = baseTokens.spacing;
export const radius = baseTokens.radius;
export const shadows = baseTokens.shadows;
export const colorAliases: ColorAliases = baseTokens.colorAliases || {};

export type Tokens = DesignTokens;
