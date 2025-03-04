import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
  }),
  title: css.raw({
    textStyle: 'h3',
    padding: '16px 24px',
    display: 'flex',
    columnGap: '12px',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'background.content.light',
    borderRadius: '8px 8px 0px 0px',

    lgDown: {
      padding: '16px',
    },
  }),
  marketMakerAnnotation: css.raw({
    position: 'relative',
    bottom: '0.5em',
    fontSize: '0.5em',
  }),
  icon: css.raw({
    height: '32px',
  }),
  mmNameContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  nameContainer: css.raw({
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
  }),
  mmName: css.raw({
    color: 'text.light',
    paddingLeft: '12px',
  }),
  chainName: css.raw({
    color: 'text.light',
  }),
  usdValue: css.raw({
    color: 'text.light',
  }),
  'headerNetwork-bsc': css.raw({
    backgroundColor: 'networkBsco20',
  }),
  'headerNetwork-heco': css.raw({
    backgroundColor: 'networkHecoo20',
  }),
  'headerNetwork-avax': css.raw({
    backgroundColor: 'networkAvaxo20',
  }),
  'headerNetwork-polygon': css.raw({
    backgroundColor: 'networkPolygono29',
  }),
  'headerNetwork-fantom': css.raw({
    backgroundColor: 'networkFantomo20',
  }),
  'headerNetwork-harmony': css.raw({
    backgroundColor: 'extracted1302',
  }),
  'headerNetwork-arbitrum': css.raw({
    backgroundColor: 'extracted656',
  }),
  'headerNetwork-celo': css.raw({
    backgroundColor: 'extracted895',
  }),
  'headerNetwork-moonriver': css.raw({
    backgroundColor: 'networkMoonrivero40',
  }),
  'headerNetwork-cronos': css.raw({
    backgroundColor: 'networkCronos',
  }),
  'headerNetwork-fuse': css.raw({
    backgroundColor: 'networkFuseo20',
  }),
  'headerNetwork-metis': css.raw({
    backgroundColor: 'networkMetiso40',
  }),
  'headerNetwork-aurora': css.raw({
    backgroundColor: 'networkAurorao20',
  }),
  'headerNetwork-moonbeam': css.raw({
    backgroundColor: 'networkMoonbeamo40',
  }),
  'headerNetwork-optimism': css.raw({
    backgroundColor: 'networkOptimismo20',
  }),
  'headerNetwork-emerald': css.raw({
    backgroundColor: 'networkEmeraldo20',
  }),
  'headerNetwork-kava': css.raw({
    backgroundColor: 'networkKavao20',
  }),
  'headerNetwork-ethereum': css.raw({
    backgroundColor: 'networkEthereumo20',
  }),
  'headerNetwork-canto': css.raw({
    backgroundColor: 'networkCantoo20',
  }),
  'headerNetwork-zksync': css.raw({
    backgroundColor: 'blacko29',
  }),
  'headerNetwork-zkevm': css.raw({
    backgroundColor: 'networkZkevmo20',
  }),
  'headerNetwork-base': css.raw({
    backgroundColor: 'networkBaseHeader',
  }),
  'headerNetwork-gnosis': css.raw({
    backgroundColor: 'networkGnosiso40',
  }),
  'headerNetwork-linea': css.raw({
    backgroundColor: 'networkLineaMantleFraxModeMtPellerino20',
  }),
  'headerNetwork-mantle': css.raw({
    backgroundColor: 'networkLineaMantleFraxModeMtPellerino20',
  }),
  'headerNetwork-fraxtal': css.raw({
    backgroundColor: 'networkLineaMantleFraxModeMtPellerino20',
  }),
  'headerNetwork-mode': css.raw({
    backgroundColor: 'networkLineaMantleFraxModeMtPellerino20',
  }),
  'headerNetwork-manta': css.raw({
    backgroundColor: 'networkLineaMantleFraxModeMtPellerino20',
  }),
  'headerNetwork-real': css.raw({
    backgroundColor: 'extracted1571',
  }),
  'headerNetwork-sei': css.raw({
    backgroundColor: 'extracted1571',
  }),
  'headerNetwork-rootstock': css.raw({
    backgroundColor: 'extracted1571',
  }),
  'headerNetwork-scroll': css.raw({
    backgroundColor: 'extracted2530',
  }),
  'headerNetwork-sonic': css.raw({
    background: 'linear-gradient(90deg, rgba(16,40,60,0.5) 0%, rgba(254,154,76,0.5) 100%)',
  }),
  'headerNetwork-lisk': css.raw({
    backgroundColor: '#000',
  }),
  'headerNetwork-berachain': css.raw({
    backgroundColor: 'rgb(129, 70, 37)',
  }),
  'headerMM-system9': css.raw({
    backgroundColor: 'extracted1306',
  }),
};
