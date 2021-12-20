import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    type: 'dark',
    background: {
      default: '#232743',
      paper: '#232743',
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
      fontStyle: 'semibold',
    },
    h2: {
      fontSize: '32px',
      lineHeight: '40px',
      fontStyle: 'semibold',
    },
    h3: {
      fontSize: '24px',
      lineHeight: '32px',
      fontStyle: 'semibold',
    },
    h4: {
      fontSize: '21px',
      lineHeight: '24px',
      fontStyle: 'semibold',
    },
    h5: {
      fontSize: '18px',
      lineHeight: '28px',
      fontStyle: 'semibold',
    },
    body1: {
      fontSize: '15px',
      lineHeight: '24px',
    },
  },
});

export { theme };
