import type { Theme } from '@material-ui/core';
import { transform } from 'lodash-es';
import type { StyleRules } from '@material-ui/styles/withStyles/withStyles';

export const styles = (theme: Theme) => ({
  vaultIdentity: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row' as const,
    columnGap: '16px',
    minWidth: 0,
    textDecoration: 'none',
  },
  vaultNameTags: {
    minWidth: 0, // needed for overflowing tags
  },
  vaultName: {
    ...theme.typography['h3'],
    color: '#F5F5FF',
    textDecoration: 'none' as const,
  },
  vaultNameBoosted: {
    color: '#DB8332',
  },
  vaultNetwork: {
    position: 'absolute' as const,
    top: '-2px',
    left: '-2px',
    width: '28px',
    height: '28px',
    border: 'solid 2px #363B63',
    borderBottomRightRadius: '16px',
    '& img': {
      width: '22px',
      height: '22px',
    },
  },
  ...transform(theme.palette.background.networks, (result: StyleRules, color, network) => {
    result[`vaultNetwork-${network}`] = {
      backgroundColor: color,
    };
  }),
});
