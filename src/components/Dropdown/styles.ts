import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  dropdown: {
    width: '350px',
    maxWidth: 'calc(100% - 32px)',
    zIndex: 1000,
  },
  dropdownInner: {
    backgroundColor: theme.palette.background.v2.contentLight,
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0px 4px 24px 24px rgba(19, 17, 34, 0.16), 0px 2px 8px rgba(20, 18, 33, 0.2)',
  },
});
