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
    v2: {
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
