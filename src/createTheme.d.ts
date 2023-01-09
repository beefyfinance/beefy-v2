import {
  FontStyle,
  FontStyleOptions,
  TypographyStyle,
  TypographyStyleOptions,
  TypographyUtils,
} from '@material-ui/core/styles/createTypography';

declare module '@material-ui/core/styles/createPalette' {
  export interface TypeBackground {
    footer: string;
    light: string;
    content: string;
    contentLight: string;
    header: string;
    alternativeFooterHeader: string;
    cta: string;
    appBG: string;
    filters: {
      active: string;
      inactive: string;
      outline: string;
      footer: string;
    };
    vaults: {
      default: string;
      defaultOutline: string;
      boostOutline: string;
      gov: string;
      govOutline: string;
      inactive: string;
      inactiveOutline: string;
    };
    snackbars: {
      bg: string;
      bgLine: string;
      bgBtn: string;
      text: string;
      error: string;
    };
    dashboard: {
      summaryCard: string;
      iconBg: string;
      cardBg: string;
      filter: string;
    };
  }

  export interface TypeText {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
    dark: string;
    middle: string;
    light: string;
  }
}

declare module '@material-ui/core/styles' {
  export interface ThemeOptions {}
}

declare module '@material-ui/core/styles/createTypography' {
  export type CustomVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'body-lg'
    | 'body-lg-med'
    | 'body-sm'
    | 'body-sm-med'
    | 'subline-lg'
    | 'subline-sm';
  export type Variant = CustomVariant;

  export interface TypographyOptions
    extends Partial<Record<CustomVariant, TypographyStyleOptions> & FontStyleOptions> {}

  export interface Typography
    extends Record<CustomVariant, TypographyStyle>,
      FontStyle,
      TypographyUtils {}
}
