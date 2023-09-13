import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  quotes: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
  },
  quoteButton: {},
  quoteButtonSelected: {
    background: 'green',
  },
});
