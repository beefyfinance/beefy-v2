import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  pnlContainer: {
    borderRadius: '12px',
    backgroundColor: '#2D3153',
  },
  graphContainer: {
    padding: '18px 0px',
    '& text': {
      fill: theme.palette.text.disabled,
    },
  },
});
