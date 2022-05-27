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
    header: string;
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
  }
}

declare module '@material-ui/core/styles' {
  export interface ThemeOptions {
    test?: boolean;
  }
}

declare module '@material-ui/core/styles/createTypography' {
  export type CustomVariant =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'body-lg'
    | 'body-lg-bold'
    | 'body-sm'
    | 'body-sm-bold'
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
