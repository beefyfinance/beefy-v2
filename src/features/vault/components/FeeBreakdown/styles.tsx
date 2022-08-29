import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  feeContainer: {
    backgroundColor: theme.palette.background.light,
    borderRadius: '10px',
  },
  title: {
    ...theme.typography['subline-lg'],
    color: '#8585A6',
    marginBottom: '8px',
  },
  label: {
    ...theme.typography['subline-sm'],
    paddingTop: 5,
    color: theme.palette.text.disabled,
    display: 'flex',
    alignItems: 'center',
  },
  value: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
    paddingTop: '0',
  },
  smallText: {
    ...theme.typography['body-sm'],
    paddingTop: 5,
    color: theme.palette.text.disabled,
  },
  tooltipTrigger: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
    marginLeft: '4px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
});
