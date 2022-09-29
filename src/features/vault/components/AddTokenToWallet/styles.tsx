import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    rowGap: '16px',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.vaults.defaultOutline,
    padding: '16px',
  },
  text: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
    marginLeft: '8px',
  },
  token: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  buttons: {
    display: 'flex',
    columnGap: '8px',
    rowGap: '8px',
    flexWrap: 'wrap' as const,
  },
  button: {
    ...theme.typography['body-lg'],
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#484F84',
    borderColor: 'transparent' as const,
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.text.primary,
      backgroundColor: '#3F466D',
      borderColor: 'transparent' as const,
      transition: 'color 0.1s',
    },
  },
  icon: {
    marginLeft: '4px',
    '&:hover': {
      fill: theme.palette.text.primary,
    },
  },
  linkButtonBg: {
    backgroundColor: '#484F84',
  },
});
