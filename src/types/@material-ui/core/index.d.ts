import type {
  FontStyle,
  FontStyleOptions,
  TypographyStyle,
  TypographyStyleOptions,
  TypographyUtils,
} from '@material-ui/core/styles/createTypography';
import type { Breakpoint } from '@material-ui/core/styles/createBreakpoints';
import type { ReactNode } from 'react';

declare module '@material-ui/core/styles/createPalette' {
  export interface TypeBackground {
    cta: string;
    footerHeader: string;
    appBg: string;
    summaryCard: string;
    iconBg: string;
    contentPrimary: string;
    contentDark: string;
    border: string;
    searchInputBg: string;
    contentLight: string;
    buttons: {
      button: string;
      buttonHover: string;
      boost: string;
      boostHover: string;
    };
    vaults: {
      default: string;
      gov: string;
      boost: string;
      clm: string;
      clmPool: string;
      clmVault: string;
      inactive: string;
    };
    txsModal: {
      bg: string;
      bgLine: string;
      text: string;
      error: string;
    };
    tags: {
      boost: string;
      earnings: string;
      retired: string;
      paused: string;
      clm: string;
      platformClm: string;
      platformGov: string;
    };
    indicators: {
      loading: string;
      warning: string;
      error: string;
      success: string;
      info: string;
    };
  }

  export interface TypeTooltipTheme {
    background: string;
    text: {
      title: string;
      content: string;
      label: string;
      value: string;
      link: string;
    };
  }

  export interface TypeTooltip {
    dark: TypeTooltipTheme;
    light: TypeTooltipTheme;
  }

  export interface TypeText {
    hint: string;
    dark: string;
    middle: string;
    light: string;
    lightest: string;
  }

  export interface PaletteOptions {
    background: TypeBackground;
    text: TypeText;
    tooltip: TypeTooltip;
  }

  export interface Palette {
    background: TypeBackground;
    text: TypeText;
    tooltip: TypeTooltip;
  }
}

declare module '@material-ui/core/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
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

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface TypographyOptions
    extends Partial<Record<CustomVariant, TypographyStyleOptions> & FontStyleOptions> {}

  export interface Typography
    extends Record<CustomVariant, TypographyStyle>,
      FontStyle,
      TypographyUtils {}
}

declare module '@material-ui/core/Hidden' {
  export interface HiddenProps {
    /**
     * `children` is explicit in react 18 but was implicit in 17
     */
    children?: ReactNode;
    /**
     * Specify which implementation to use.  'js' is the default, 'css' works better for
     * server-side rendering.
     */
    implementation?: 'js' | 'css';
    /**
     * You can use this prop when choosing the `js` implementation with server-side rendering.
     *
     * As `window.innerWidth` is unavailable on the server,
     * we default to rendering an empty component during the first mount.
     * You might want to use an heuristic to approximate
     * the screen width of the client browser screen width.
     *
     * For instance, you could be using the user-agent or the client-hints.
     * https://caniuse.com/#search=client%20hint
     */
    initialWidth?: Breakpoint;
    /**
     * If `true`, screens this size and down will be hidden.
     */
    lgDown?: boolean;
    /**
     * If `true`, screens this size and up will be hidden.
     */
    lgUp?: boolean;
    /**
     * If `true`, screens this size and down will be hidden.
     */
    mdDown?: boolean;
    /**
     * If `true`, screens this size and up will be hidden.
     */
    mdUp?: boolean;
    /**
     * Hide the given breakpoint(s).
     */
    only?: Breakpoint | Breakpoint[];
    /**
     * If `true`, screens this size and down will be hidden.
     */
    smDown?: boolean;
    /**
     * If `true`, screens this size and up will be hidden.
     */
    smUp?: boolean;
    /**
     * If `true`, screens this size and down will be hidden.
     */
    xlDown?: boolean;
    /**
     * If `true`, screens this size and up will be hidden.
     */
    xlUp?: boolean;
    /**
     * If `true`, screens this size and down will be hidden.
     */
    xsDown?: boolean;
    /**
     * If `true`, screens this size and up will be hidden.
     */
    xsUp?: boolean;
  }
}
