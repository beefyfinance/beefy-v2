import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  pnlContainer: {
    borderRadius: '12px',
    backgroundColor: '#2D3153',
  },
  title: {
    display: 'flex',
    padding: '24px',
    borderRadius: '12px 12px 0px 0px',
    backgroundColor: '#232743',
  },
  graphContainer: {
    padding: '24px 0px',
    '& text': {
      fill: theme.palette.text.disabled,
    },
  },
  footer: {
    borderTop: '2px solid #363B63',
    display: 'flex',
    padding: '24px',
    borderRadius: '0px 0px 12px 12px',
  },
});
