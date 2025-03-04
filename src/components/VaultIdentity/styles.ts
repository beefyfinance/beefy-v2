import { css } from '@repo/styles/css';

export const styles = {
  vaultIdentity: css.raw({
    display: 'flex',
    flexGrow: '0',
    flexShrink: '0',
    flexDirection: 'row',
    columnGap: '16px',
    minWidth: '0',
    textDecoration: 'none',
  }),
  vaultNameTags: css.raw({
    minWidth: '0',
  }),
  vaultName: css.raw({
    textStyle: 'h3',
    color: 'text.light',
    textDecoration: 'none',
  }),
  vaultNameBoosted: css.raw({
    color: 'background.vaults.boost',
  }),
  vaultNetwork: css.raw({
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    width: '28px',
    height: '28px',
    border: 'solid 2px {colors.background.content.dark}',
    borderBottomRightRadius: '16px',
    '& img': {
      width: '22px',
      height: '22px',
    },
  }),
  'vaultNetwork-bsc': css.raw({
    backgroundColor: 'networks.bsc',
  }),
  'vaultNetwork-heco': css.raw({
    backgroundColor: 'networks.heco',
  }),
  'vaultNetwork-avax': css.raw({
    backgroundColor: 'networks.avax',
  }),
  'vaultNetwork-polygon': css.raw({
    backgroundColor: 'networks.polygon',
  }),
  'vaultNetwork-fantom': css.raw({
    backgroundColor: 'networks.fantom',
  }),
  'vaultNetwork-harmony': css.raw({
    backgroundColor: 'networks.harmony',
  }),
  'vaultNetwork-arbitrum': css.raw({
    backgroundColor: 'networks.arbitrum',
  }),
  'vaultNetwork-celo': css.raw({
    backgroundColor: 'networks.celo',
  }),
  'vaultNetwork-moonriver': css.raw({
    backgroundColor: 'networks.moonriver',
  }),
  'vaultNetwork-cronos': css.raw({
    backgroundColor: 'networks.cronos',
  }),
  'vaultNetwork-fuse': css.raw({
    backgroundColor: 'networks.fuse',
  }),
  'vaultNetwork-metis': css.raw({
    backgroundColor: 'networks.metis',
  }),
  'vaultNetwork-aurora': css.raw({
    backgroundColor: 'networks.aurora',
  }),
  'vaultNetwork-moonbeam': css.raw({
    backgroundColor: 'networks.moonbeam',
  }),
  'vaultNetwork-emerald': css.raw({
    backgroundColor: 'networks.emerald',
  }),
  'vaultNetwork-optimism': css.raw({
    backgroundColor: 'networks.optimism',
  }),
  'vaultNetwork-kava': css.raw({
    backgroundColor: 'networks.kava',
  }),
  'vaultNetwork-ethereum': css.raw({
    backgroundColor: 'networks.ethereum',
  }),
  'vaultNetwork-canto': css.raw({
    backgroundColor: 'networks.canto',
  }),
  'vaultNetwork-zksync': css.raw({
    backgroundColor: 'networks.zksync',
  }),
  'vaultNetwork-zkevm': css.raw({
    backgroundColor: 'networks.zkevm',
  }),
  'vaultNetwork-base': css.raw({
    backgroundColor: 'networks.base',
  }),
  'vaultNetwork-gnosis': css.raw({
    backgroundColor: 'networks.gnosis',
  }),
  'vaultNetwork-linea': css.raw({
    backgroundColor: 'networks.linea',
  }),
  'vaultNetwork-mantle': css.raw({
    backgroundColor: 'networks.mantle',
  }),
  'vaultNetwork-fraxtal': css.raw({
    backgroundColor: 'networks.fraxtal',
  }),
  'vaultNetwork-mode': css.raw({
    backgroundColor: 'networks.mode',
  }),
  'vaultNetwork-manta': css.raw({
    backgroundColor: 'networks.manta',
  }),
  'vaultNetwork-real': css.raw({
    backgroundColor: 'networks.real',
  }),
  'vaultNetwork-sei': css.raw({
    backgroundColor: 'networks.sei',
  }),
  'vaultNetwork-rootstock': css.raw({
    backgroundColor: 'networks.rootstock',
  }),
  'vaultNetwork-scroll': css.raw({
    backgroundColor: 'networks.scroll',
  }),
  'vaultNetwork-lisk': css.raw({
    backgroundColor: 'networks.lisk',
  }),
  'vaultNetwork-sonic': css.raw({
    backgroundColor: 'networks.sonic',
    background:
      'linear-gradient(90deg, token(colors.networks.sonic) 0%, token(colors.networks.sonic.secondary, colors.networks.sonic) 100%)',
  }),
  'vaultNetwork-berachain': css.raw({
    backgroundColor: 'networks.berachain',
  }),
};
