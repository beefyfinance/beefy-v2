import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '16px',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '2px solid #363B63',
    padding: '16px 24px',
    borderRadius: '0px 0px 12px 12px',
    [theme.breakpoints.down('sm')]: {
      padding: '8px 16px',
    },
  },
});
