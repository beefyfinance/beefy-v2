import { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  holder: {},
  title: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
    marginBottom: '8px',
  },
  routeHolder: {
    borderRadius: '8px',
    border: 'solid 2px #2D3153',
    overflow: 'hidden' as const,
  },
  routeHeader: {
    background: '#2D3153',
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  routerHeaderClickable: {
    cursor: 'pointer',
  },
  routeHeaderProvider: {},
  routeContent: {
    borderRadius: '0px 0px 8px 8px',
    padding: '16px',
  },
  steps: {
    ...theme.typography['body-lg'],
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '12px 8px',
  },
  stepNumber: {
    color: theme.palette.text.dark,
    flexShrink: 0,
    flexGrow: 0,
  },
  stepContent: {
    color: theme.palette.text.middle,
  },
});
