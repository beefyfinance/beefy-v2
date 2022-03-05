import { createTheme } from '@material-ui/core/styles';

// Module augmentation to allow custom theme entries
declare module '@material-ui/core/styles/createPalette' {
  interface TypeBackground {
    footer: string
    light: string
    content: string
    header: string
    cta: string
    filters: {
      active: string,
      inactive: string
      outline: string
      footer: string
    },
    vaults: {
      default: string
      defaultOutline: string
      boostOutline: string
      gov: string
      govOutline: string
      inactive: string
      inactiveOutline: string
    },
    snackbars: {
      bg: string
      bgLine: string
      bgBtn: string
      text: string
      error: string
    },
  }
}


const theme = createTheme({
  palette: {
    type: 'dark',
    primary: { main: '#59A662', light: '#CDF7D2', dark: '#004708' },
    background: {
      default: '#232743',
      paper: '#232743',
      light: '#313759',
      content: '#2D3153',
      header: '#121212',
      footer: '#121212',
      cta: '#59A662',
      filters: {
        active: '#4C5480',
        inactive: '#262A40',
        outline: '#303550',
        footer: '#191C29',
      },
      vaults: {
        default: '#2D3153',
        defaultOutline: '#363B63',
        boostOutline: '#DB8332',
        gov: '#342763',
        govOutline: '#42477B',
        inactive: '#111321',
        inactiveOutline: '#762C2C',
      },
      snackbars: {
        bg: '#FFF',
        bgLine: '#E5E5E5',
        bgBtn: '#363B63',
        text: '#2D3153',
        error: '#DC2C10',
      },
    },
    text: {
      primary: '#F5F5FF',
      secondary: '#D0D0DA',
      disabled: '#8A8EA8',
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundColor: '#1B1E31',
        },
      },
    },
  },
  typography: {
    fontFamily: ['Proxima Nova', 'sans-serif'].join(','),
    h1: {
      fontSize: '45px',
      lineHeight: '56px',
      fontWeight: 600,
    },
    h2: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 600,
    },
    h3: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
    },
    h4: {
      fontSize: '21px',
      lineHeight: '24px',
      fontWeight: 600,
    },
    h5: {
      fontSize: '18px',
      lineHeight: '28px',
      fontWeight: 600,
    },
    body1: {
      fontSize: '15px',
      lineHeight: '24px',
    },
    body2: {
      fontSize: '12px',
      lineHeight: '18px',
    },
  },
});

export { theme };
