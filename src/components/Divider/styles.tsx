import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  customDivider: {
    display: 'flex',
    alignItems: 'center',
    margin: `${theme.spacing(2)}px 0px`,
    '& svg': {
      color: theme.palette.text.secondary,
      fill: 'currentColor',
      fontSize: '1.5rem',
      width: '1em',
      height: '1em',
      margin: '0 12px',
      '&:hover': {
        cursor: 'pointer',
        color: theme.palette.text.primary,
      },
    },
  },
  line: {
    height: '2px',
    width: '100%',
    backgroundColor: theme.palette.background.vaults.default,
    borderRadius: '8px',
  },
});
