import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    type: 'dark',
    primary: { main: '#59A662', light: '#CDF7D2', dark: '#004708' },
    background: {
      default: '#232743',
      paper: '#232743',
      light: '#313759',
      header: '#121212',
      cta: '#59A662',
      tags: {
        bifi: '#5C499D',
        stable: '#3D8F61',
        blueChip: '#3E5FA7',
        lowRisk: '#4683AA',
        boost: '#E88225',
        eol: '#313A68',
      },
    } as any, // TODO: fix any
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
  },
});

export { theme };
