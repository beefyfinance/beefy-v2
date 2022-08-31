import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {},
  title: {
    ...theme.typography['h1'],
    fontSize: '45px',
    lineHeight: '56px',
    color: '#F5F5FF',
  },
  text: {
    ...theme.typography['body-lg'],
    color: '#D0D0DA',
    marginTop: '32px',
    '& p': {
      marginTop: 0,
      marginBottom: '1em',
      '&:last-child': {
        marginBottom: 0,
      },
    },
  },
  poweredBy: {
    marginTop: '64px',
  },
  poweredByLabel: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
    marginTop: '32px',
  },
  poweredByLogos: {
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
});
