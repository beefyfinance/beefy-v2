import type { Theme } from '@material-ui/core';
import { transform } from 'lodash-es';
import type { StyleRules } from '@material-ui/styles/withStyles/withStyles';

export const styles = (theme: Theme) => ({
  container: {
    display: 'grid',
    gap: '16px',
  },
  suggestions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(140px, 1fr))',
    gap: '16px',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: 'repeat(2, minmax(140px, 1fr))',
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))',
    },
  },
  suggestion: {
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    background: theme.palette.background.default,
    borderRadius: '8px',
    padding: '16px',
    margin: 0,
    textAlign: 'left' as const,
    textDecoration: 'none',
    color: theme.palette.text.primary,
  },
  vaultIdentity: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '16px',
  },
  vaultName: {
    ...theme.typography['h3'],
  },
  vaultStats: {
    ...theme.typography['body-lg-med'],
    marginBottom: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
  },
  vaultStatApy: {},
  vaultStatTvl: {},
  vaultTags: {
    marginTop: 'auto',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  vaultTagNetwork: {
    display: 'flex',
    borderRadius: '8px',
    gap: '4px',
    alignItems: 'center',
  },
  vaultNetworkIcon: {
    width: '16px',
    height: '16px',
    display: 'block',
    borderRadius: '50%',
  },
  vaultNetworkName: {},
  ...transform(theme.palette.background.networks, (result: StyleRules, color, network) => {
    result[`suggestion-${network}`] = {
      borderColor: color,
      '& vaultNetworkIcon': {
        background: color,
      },
    };
  }),
});
