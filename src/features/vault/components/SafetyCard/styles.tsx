import type { Theme } from '@material-ui/core';

export const styles = (theme: Theme) => ({
  header: {
    display: 'flex',
  },
  riskList: {
    marginBottom: '32px',
  },
  warning: {
    marginBottom: '18px',
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
    color: theme.palette.text.middle,
    marginRight: 8,
  },
  riskCategory: {
    color: theme.palette.text.dark,
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
    marginTop: '16px',
    '& p': {
      margin: '0 0 12px 0',
      color: theme.palette.text.middle,
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
  tooltipIcon: {
    color: theme.palette.text.dark,
  },
  safetyLabel: {
    ...theme.typography.h2,
    color: theme.palette.text.light,
    marginRight: '16px',
  },
  tooltipHolder: {
    marginLeft: '4px',
  },
  howItWorksContainer: {
    padding: 16,
    backgroundColor: theme.palette.background.contentLight,
  },
  titleClassName: {
    ...theme.typography['body-lg-med'],
    color: theme.palette.text.light,
  },
  up: {
    fill: theme.palette.primary.main,
  },
  down: {
    fill: theme.palette.background.indicators.error,
  },
});
