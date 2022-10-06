import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  header: {
    display: 'flex',
  },
  riskList: {
    marginBottom: '32px',
  },
  riskRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    marginBottom: '16px',
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
    marginTop: theme.spacing(2),
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
    ...theme.typography.h2,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(2),
  },
  tooltipHolder: {
    marginLeft: theme.spacing(0.5),
  },
  howItWorksContainer: {
    padding: 16,
    backgroundColor: theme.palette.background.vaults.defaultOutline,
  },
  titleClassName: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.primary,
  },
});
