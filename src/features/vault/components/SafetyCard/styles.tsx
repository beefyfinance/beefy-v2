import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  riskList: {
    marginBottom: '32px',
  },
  riskRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: '24px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  risk: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.secondary,
    marginRight: 8,
  },
  riskCategory: {
    color: theme.palette.text.disabled,
  },
  infoContainer: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  moreInfoContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  notes: {
    '& p': {
      margin: '0 0 12px 0',
      color: theme.palette.text.secondary,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
  arrow: {
    marginTop: '5px',
    marginRight: '8px',
  },
  tooltipLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  safetyLabel: {
    ...theme.typography['subline-lg'],
    color: theme.palette.text.disabled,
  },
  tooltipHolder: {
    marginLeft: theme.spacing(0.5),
  },
});
