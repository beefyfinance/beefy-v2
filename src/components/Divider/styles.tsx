import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  customDivider: {
    display: 'flex',
    alignItems: 'center',
    margin: `${theme.spacing(2)}px 0px`,
  },
  line: {
    height: '2px',
    width: '100%',
    backgroundColor: theme.palette.background.vaults.default,
    borderRadius: '8px',
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.background.vaults.defaultOutline,
    borderRadius: '100%',
    margin: '0 12px',
    height: '24px',
    width: '24px',
    padding: '8px',
    '& svg': {
      color: theme.palette.text.secondary,
      fill: 'currentColor',
      fontSize: '1.5rem',
      width: '1em',
      height: '1em',
      '&:hover': {
        cursor: props => (props.clickleable ? 'pointer' : 'auto'),
        color: theme.palette.text.primary,
      },
    },
  },
});
