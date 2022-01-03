export const styles = theme => ({
  container: {},
  tabs: {
    backgroundColor: theme.palette.background.default,
    borderRadius: 8,
    border: `2px solid ${theme.palette.background.vaults.defaultOutline}`,
    '& .MuiTabs-indicator': {
      display: 'none',
      color: 'transparent',
    },
    '& .MuiTab-root': {
      minWidth: 70,
    },
    '& .MuiTab-textColorPrimary': {
      color: theme.palette.text.disabled,
    },
    '& .Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      borderRadius: 8,
      color: theme.palette.text.primary,
      padding: '5px',
    },
    '& .MuiTab-wrapper': {
      fontWeight: 700,
    },
  },
  basicTabs: {
    float: 'right',
    '& .MuiTabs-indicator': {
      display: 'none',
      color: 'transparent',
    },
    '& .MuiTab-root': {
      minWidth: 'fit-content',
      padding: '0 12',
    },
    '& .MuiTab-textColorPrimary': {
      fontWeight: 600,
      letterSpacing: 0.2,
      color: theme.palette.text.disabled,
    },
    '& .Mui-selected': {
      color: theme.palette.text.primary,
    },
  },
});
