import type { Theme } from '@material-ui/core';

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
    color: theme.palette.text.light,
    textDecoration: 'none' as const,
  },
  vaultNameBoosted: {
    color: theme.palette.background.vaults.boost,
  },
  vaultNetwork: {
    position: 'absolute' as const,
    top: '-2px',
    left: '-2px',
    width: '28px',
    height: '28px',
    border: `solid 2px ${theme.palette.background.contentDark}`,
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
    backgroundColor: '#f5f0fd',
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
    backgroundColor: '#06353D',
  },
  'vaultNetwork-cronos': {
    backgroundColor: '#121926',
  },
  'vaultNetwork-fuse': {
    backgroundColor: '#B4F9BA',
  },
  'vaultNetwork-metis': {
    backgroundColor: '#00CFFF',
  },
  'vaultNetwork-aurora': {
    backgroundColor: '#70d44b',
  },
  'vaultNetwork-moonbeam': {
    backgroundColor: '#958FDC',
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
  'vaultNetwork-canto': {
    backgroundColor: '#06fc99',
  },
  'vaultNetwork-zksync': {
    backgroundColor: '#fff',
  },
  'vaultNetwork-zkevm': {
    backgroundColor: '#8247e4',
  },
  'vaultNetwork-base': {
    backgroundColor: '#fff',
  },
  'vaultNetwork-gnosis': {
    backgroundColor: '#133629',
  },
  'vaultNetwork-linea': {
    backgroundColor: '#121212',
  },
  'vaultNetwork-mantle': {
    backgroundColor: '#121212',
  },
  'vaultNetwork-fraxtal': {
    backgroundColor: '#000',
  },
  'vaultNetwork-mode': {
    backgroundColor: '#000',
  },
  'vaultNetwork-manta': {
    backgroundColor: '#FFF',
  },
  'vaultNetwork-real': {
    backgroundColor: '#FFF',
  },
  'vaultNetwork-sei': {
    backgroundColor: '#000',
  },
  'vaultNetwork-rootstock': {
    backgroundColor: '#000',
  },
  'vaultNetwork-scroll': {
    backgroundColor: '#ffe6c8',
  },
  'vaultNetwork-lisk': {
    backgroundColor: '#000',
  },
  'vaultNetwork-sonic': {
    background: 'linear-gradient(90deg, rgba(16,40,60,1) 0%, rgba(254,154,76,1) 100%)',
  },
});
