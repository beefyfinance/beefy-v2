import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  container: {},
  tabs: {
    backgroundColor: theme.palette.background.buttons.button,
    borderRadius: 8,
    border: `2px solid ${theme.palette.background.contentLight}`,
    '& .MuiTabs-indicator': {
      display: 'none' as const,
      color: 'transparent',
    },
    '& .MuiTab-root': {
      minWidth: 70,
    },
    '& .MuiTab-textColorPrimary': {
      color: theme.palette.text.dark,
    },
    '& .Mui-selected': {
      backgroundColor: theme.palette.background.contentLight,
      borderRadius: 4,
      color: theme.palette.text.light,
      padding: '5px',
    },
  },
  basicTabs: {
    '& .MuiTabs-indicator': {
      display: 'none',
      color: 'transparent',
    },
    '& .MuiTab-root': {
      minWidth: 'fit-content',
      padding: '0 12',
    },
    '& .MuiTab-textColorPrimary': {
      color: theme.palette.text.dark,
    },
    '& .Mui-selected': {
      color: theme.palette.text.light,
    },
  },
});
