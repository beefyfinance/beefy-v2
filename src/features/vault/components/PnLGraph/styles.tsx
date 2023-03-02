import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  pnlContainer: {
    borderRadius: '12px',
    backgroundColor: '#2D3153',
  },
  graphContainer: {
    padding: '16px 0px',
    '& text': {
      fill: theme.palette.text.disabled,
      [theme.breakpoints.down('xs')]: {
        fontSize: '12px',
      },
    },
  },
});
