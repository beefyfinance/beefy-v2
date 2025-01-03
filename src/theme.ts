import { createTheme } from '@material-ui/core/styles';
import type { ThemeOptions } from '@material-ui/core/styles';
import type { TypographyStyleOptions } from '@material-ui/core/styles/createTypography';
import { featureFlag_breakpoints } from './features/data/utils/feature-flags';

const fontStack = [
  '"DM Sans"',
  'system-ui',
  '-apple-system',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  '"Noto Sans"',
  '"Liberation Sans"',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  '"Noto Color Emoji"',
].join(',');

const fontStyles: Record<string, TypographyStyleOptions> = {
  h1: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 500,
  },
  h2: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 500,
  },
  h3: {
    fontSize: '21px',
    lineHeight: '24px',
    fontWeight: 500,
  },
  'body-lg': {
    fontFamily: fontStack,
    fontSize: '16px',
    lineHeight: '24px',
    textTransform: 'none' as const,
    fontWeight: 400,
  },
  'body-lg-med': {
    fontFamily: fontStack,
    fontSize: '16px',
    lineHeight: '24px',
    textTransform: 'none' as const,
    fontWeight: 500,
  },
  'body-sm': {
    fontFamily: fontStack,
    fontSize: '12px',
    lineHeight: '20px',
    textTransform: 'none' as const,
    fontWeight: 400,
  },
  'body-sm-med': {
    fontFamily: fontStack,
    fontSize: '12px',
    lineHeight: '20px',
    textTransform: 'none' as const,
    fontWeight: 500,
  },
  'subline-lg': {
    fontFamily: fontStack,
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  'subline-sm': {
    fontFamily: fontStack,
    fontSize: '12px',
    lineHeight: '20px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
};

const colors = {
  text: {
    lightest: '#FFF',
    light: '#F5F5FF',
    middle: '#D0D0DA',
    dark: '#999CB3',
  },
};

function withCustomBreakpoints(theme: ThemeOptions) {
  if (featureFlag_breakpoints()) {
    const params = new URLSearchParams(window.location.search);
    const readBreakpoint = (name: string, defaultWidth: number) => {
      if (params.has(name)) {
        return parseInt(params.get(name) || '0') || defaultWidth;
      }
      return defaultWidth;
    };

    return {
      ...theme,
      breakpoints: {
        ...theme.breakpoints,
        values: {
          xs: 0,
          sm: readBreakpoint('sm', 600),
          md: readBreakpoint('md', 960),
          lg: readBreakpoint('lg', 1260),
          xl: readBreakpoint('xl', 1920),
        },
      },
    };
  }

  return theme;
}

const tooltipLight = {
  background: '#fff',
  text: {
    title: '#1C1E32',
    content: '#1C1E32',
    value: '#242842',
    label: '#1C1E32',
    link: '#1C1E32',
  },
} as const;

const theme = createTheme(
  withCustomBreakpoints({
    palette: {
      type: 'dark',
      primary: { main: '#4DB258', light: '#68BE71', dark: '#004708' },
      background: {
        cta: '#4DB258',
        footerHeader: '#020203',
        appBg: '#121420',
        summaryCard: '#121421',
        iconBg: 'rgba(92, 112, 214, 0.2)',
        border: '#363B63',
        searchInputBg: '#121420',
        contentPrimary: '#242842',
        contentDark: '#1C1E32',
        contentLight: '#2D3153',
        buttons: {
          button: '#363B63',
          buttonHover: '#495086',
          boost: '#DB8332',
          boostHover: '#E5A66B',
        },
        vaults: {
          default: '#242842',
          gov: '#322460',
          boost: '#DB8332',
          clm: '#252C63',
          clmPool: '#252C63',
          clmVault: '#1E2A48',
          inactive: '#242032',
        },
        txsModal: {
          bg: '#FFF',
          bgLine: '#E5E5E5',
          text: '#242842',
          error: '#DC2C10',
        },
        tags: {
          boost: 'rgba(219, 131, 50, 0.50)',
          retired: 'rgba(209, 83, 71, 0.3)',
          paused: 'rgba(209, 152, 71, 0.3)',
          earnings: '#5C70D6',
          clm: '#0052CC',
          platformClm: '#38428F',
          platformGov: '#4B388F',
        },
        indicators: {
          loading: '#D6D05D',
          warning: '#D19847',
          error: '#DA5932',
          success: '#4DB258',
          info: '#5C70D6',
        },
      },
      text: {
        primary: colors.text.lightest, // default on body
        secondary: colors.text.light, // was 70% opacity white
        lightest: colors.text.lightest,
        light: colors.text.light,
        middle: colors.text.middle,
        dark: colors.text.dark,
      },
      tooltip: {
        light: tooltipLight,
        dark: {
          background: '#1C1E32',
          text: {
            title: colors.text.lightest,
            content: colors.text.light,
            value: colors.text.middle,
            label: colors.text.light,
            link: colors.text.lightest,
          },
        },
      },
    },
    typography: {
      fontFamily: fontStack,
      h1: fontStyles['h1'],
      h2: fontStyles['h2'],
      h3: fontStyles['h3'],
      button: fontStyles['body-lg-med'],
      body1: fontStyles['body-lg'],
      body2: fontStyles['body-lg'],
      'body-lg': fontStyles['body-lg'],
      'body-lg-med': fontStyles['body-lg-med'],
      'body-sm': fontStyles['body-sm'],
      'body-sm-med': fontStyles['body-sm-med'],
      'subline-lg': fontStyles['subline-lg'],
      'subline-sm': fontStyles['subline-sm'],
      h4: {
        color: 'red', // DO NOT USE
      },
      h5: {
        color: 'red', // DO NOT USE
      },
      h6: {
        color: 'red', // DO NOT USE
      },
      caption: {
        color: 'red', // DO NOT USE
      },
      subtitle1: {
        color: 'red', // DO NOT USE
      },
      subtitle2: {
        color: 'red', // DO NOT USE
      },
      overline: {
        color: 'red', // DO NOT USE
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1260,
        xl: 1920,
      },
    },
    overrides: {
      MuiCssBaseline: {
        '@global': {
          ':root': {
            '--onboard-font-family-normal': 'DM Sans',
            '--onboard-font-family-semibold': 'DM Sans',
            '--onboard-font-family-light': 'DM Sans',
            '--onboard-modal-z-index': '1',
            '--onboard-modal-backdrop': 'rgba(255,255,255,0.2)',
            '--onboard-modal-border-radius': '20px',
            '--onboard-wallet-button-border-radius': '8px',
            '--onboard-connect-header-background': '#1C1E32',
            '--onboard-connect-header-color': '#F5F5FF',
            '--onboard-modal-color': '#F5F5FF',
            '--onboard-modal-background': '#242842',
            '--onboard-main-scroll-container-background': '#242842',
            '--onboard-close-button-background': '#242842',
            '--onboard-close-button-color': '#D0D0DA',
            '--onboard-wallet-button-border-color': '#242842',
            '--onboard-wallet-button-background': '#2D3153',
            '--onboard-wallet-button-color': '#D0D0DA',
            '--onboard-wallet-button-background-hover': 'rgba(245, 245, 255, 0.08)',
            '--onboard-wallet-button-color-hover': '#fff',
            '--onboard-wallet-app-icon-border-color': '#fff',
            '--onboard-wallet-app-icon-background-transparent': '#fff',
            '--onboard-connect-sidebar-background': '#020203',
            '--onboard-connect-sidebar-color': '#F5F5FF',
            '--onboard-connect-sidebar-progress-color': '#68BE71',
            '--onboard-connect-sidebar-progress-background': '#4DB258',
            '--onboard-link-color': '#999CB3',
            '--tooltip-content-vertical-padding': '12px',
            '--tooltip-content-horizontal-padding': '16px',
            '--tooltip-content-vertical-gap': '8px',
            '--tooltip-content-horizontal-gap': '24px',
            '--tooltip-content-border-radius': '8px',
            '--tooltip-background-color': tooltipLight.background,
            '--tooltip-title-color': tooltipLight.text.title,
            '--tooltip-content-color': tooltipLight.text.content,
            '--tooltip-value-color': tooltipLight.text.value,
            '--tooltip-label-color': tooltipLight.text.label,
            '--tooltip-link-color': tooltipLight.text.link,
            '--tooltip-body-font-size': fontStyles['body-lg'].fontSize,
            '--tooltip-subline-font-size': fontStyles['subline-lg'].fontSize,
          },
          body: {
            backgroundColor: '#121420',
          },
          'onboard-v2': {
            // @ts-ignore need to force above other modals
            position: 'relative !important' as PositionProperty,
            // @ts-ignore need to force above other modals
            zIndex: '1400 !important' as ZIndexProperty,
          },
          'wcm-modal, #cryptoconnect-extension': {
            // @ts-ignore need to force above other modals
            position: 'relative !important' as PositionProperty,
            // @ts-ignore need to force above other modals
            zIndex: '1500 !important' as ZIndexProperty,
          },
        },
      },
      MuiInputBase: {
        input: fontStyles['body-lg-med'],
      },
      MuiBackdrop: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
  })
);

export { theme };
