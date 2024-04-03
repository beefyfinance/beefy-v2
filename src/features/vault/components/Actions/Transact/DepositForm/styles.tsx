import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {
    padding: '24px',
  },
  labels: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '4px',
  },
  selectLabel: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.dark,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  availableLabel: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.dark,
    marginLeft: 'auto',
  },
  availableLabelAmount: {
    ...theme.typography['body-sm-med'],
    color: theme.palette.text.middle,
  },
  inputs: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '12px',
  },
  links: {
    marginTop: '12px',
  },
  quote: {
    marginTop: '24px',
  },
  actions: {
    marginTop: '24px',
  },
});
