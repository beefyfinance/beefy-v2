import type { Theme } from '@material-ui/core';

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
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
  poweredBy: {
    marginTop: '32px',
  },
  poweredByLabel: {
    ...theme.typography['subline-sm'],
    color: '#999CB3',
    marginTop: '32px',
  },
  poweredByLogos: {
    marginTop: '16px',
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: '24px',
  },
});
