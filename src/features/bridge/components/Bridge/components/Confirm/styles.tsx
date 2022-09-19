import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  content: {
    padding: '24px',
    borderRadius: '4px',
    backgroundColor: '#232743',
  },
  confirmIntro: {
    color: theme.palette.text.secondary,
    marginBottom: '24px',
  },
  transferInfo: {
    padding: '12px',
    backgroundColor: theme.palette.background.content,
    borderRadius: '8px',
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
    fontWeight: 700,
    marginBottom: '8px',
  },
  networkAmount: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  network: {
    display: 'flex',
    alignItems: 'center',
    ...theme.typography['body-lg-med'],
  },
  networkIcon: {
    width: '20px',
    height: '20px',
    display: 'block',
    marginRight: '4px',
  },
  networkName: {
    color: theme.palette.text.secondary,
  },
  amount: {
    color: '#999CB3',
    fontWeight: 500,
  },
  address: {
    ...theme.typography['body-sm'],
    color: theme.palette.text.disabled,
    '& span': {
      color: theme.palette.text.secondary,
    },
  },
  transferDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    rowGap: '8px',
    columnGap: '8px',
    marginTop: '24px',
    padding: '12px',
    border: '2px solid #2D3153',
    borderRadius: '8px',
  },
  detailLabel: {
    ...theme.typography['body-sm'],
    fontWeight: 700,
    letterSpacing: '0.5px',
    color: '#999CB3',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
  },
  detailValue: {
    ...theme.typography['body-sm-med'],
    textAlign: 'right' as const,
    color: theme.palette.text.secondary,
  },
  buttonsContainer: {
    marginTop: '48px',
  },
  infoContainer: {
    flexGrow: 1,
  },
});
