import { Theme } from '@material-ui/core/styles';

export const styles = (theme: Theme) => ({
  vaultIdentity: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row' as const,
    columnGap: '16px',
    minWidth: 0,
  },
  vaultNameTags: {
    minWidth: 0, // needed for overflowing tags
  },
  vaultName: {
    ...theme.typography['h3'],
    color: '#F5F5FF',
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
  'vaultNetwork-bsc': {
    backgroundColor: '#F0B90B',
  },
  'vaultNetwork-heco': {
    backgroundColor: '#02943f',
  },
  'vaultNetwork-avax': {
    backgroundColor: '#e74142',
  },
  'vaultNetwork-polygon': {
    backgroundColor: '#8247e4',
  },
  'vaultNetwork-fantom': {
    backgroundColor: '#1969FF',
  },
  'vaultNetwork-harmony': {
    backgroundColor: '#01d8af',
  },
  'vaultNetwork-arbitrum': {
    backgroundColor: '#2d374b',
  },
  'vaultNetwork-celo': {
    backgroundColor: '#FCFF52',
  },
  'vaultNetwork-moonriver': {
    backgroundColor: '#c3136f',
  },
  'vaultNetwork-cronos': {
    backgroundColor: '#121926',
  },
  'vaultNetwork-fuse': {
    backgroundColor: '#071927',
  },
  'vaultNetwork-metis': {
    backgroundColor: '#00dacc',
  },
  'vaultNetwork-aurora': {
    backgroundColor: '#70d44b',
  },
  'vaultNetwork-moonbeam': {
    backgroundColor: '#211438',
  },
  'vaultNetwork-emerald': {
    backgroundColor: '#0192f6',
  },
  'vaultNetwork-optimism': {
    backgroundColor: '#ff0420',
  },
  'vaultNetwork-kava': {
    backgroundColor: '#FF564F',
  },
  'vaultNetwork-ethereum': {
    backgroundColor: '#627ee9',
  },
});
