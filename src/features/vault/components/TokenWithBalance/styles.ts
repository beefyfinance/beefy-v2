export const styles = theme => ({
  balanceContainer: {
    '& .MuiAvatar-root:not(.MuiAvatarGroup-avatar)': {
      height: 16,
      width: 16,
    },
    '& .MuiTypography-body1': {
      fontSize: '14px',
      fontWeight: '600',
      textTransform: 'inherit',
      color: theme.palette.text.primary,
    },
  },
  assetCount: {
    color: theme.palette.text.primary,
    fontWeight: 700,
  },
});
