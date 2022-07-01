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
    margin: `16px 0`,
  },
  label: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.disabled,
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
    color: theme.palette.text.primary,
  },
  amount: {
    color: '#999CB3',
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
    margin: '24px 0',
  },
  detailLabel: {
    ...theme.typography['body-sm'],
    color: '#999CB3',
  },
  detailValue: {
    ...theme.typography['body-sm-med'],
    textAlign: 'right' as const,
    color: theme.palette.text.secondary,
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    rowGap: '16px',
  },
});
