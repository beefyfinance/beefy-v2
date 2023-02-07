import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alingItems: 'center',
    borderTop: '2px solid #363B63',
    padding: '24px',
    borderRadius: '0px 0px 12px 12px',
  },
  items: {
    display: 'flex',
    columnGap: '24px',
    alignItems: 'center',
  },
  colorReference: {
    height: '2px',
    width: '12px',
  },
  legendItem: {
    ...theme.typography['subline-lg'],
    fontWeight: 700,
    color: theme.palette.text.disabled,
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
  },
});
