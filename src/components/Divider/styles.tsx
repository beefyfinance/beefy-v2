import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  customDivider: {
    display: 'flex',
    alignItems: 'center',
    margin: '16pxpx 0px',
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
    background: theme.palette.background.contentLight,
    borderRadius: '100%',
    margin: '0 12px',
    height: '24px',
    width: '24px',
    padding: '8px',
    '& svg': {
      color: theme.palette.text.middle,
      fill: 'currentColor',
      fontSize: '1.5rem',
      width: '1em',
      height: '1em',
      '&:hover': {
        cursor: props => (props.clickleable ? 'pointer' : 'auto'),
        color: theme.palette.text.light,
      },
    },
  },
});
