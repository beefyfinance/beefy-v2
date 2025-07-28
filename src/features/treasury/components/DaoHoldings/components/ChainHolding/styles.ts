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
    textStyle: 'body.sm',
    position: 'relative',
    bottom: '0.5em',
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
  headerNetwork: css.raw({
    backgroundColor: 'colorPalette.header.primary',
  }),
  headerNetworkGradient: css.raw({
    // panda seems to have token replacement bug here, so using css variables
    backgroundImage:
      'linear-gradient(90deg, var(--colors-color-palette-header-primary) 0%, var(--colors-color-palette-header-secondary, var(--colors-color-palette-header-primary)) 100%)',
  }),
  'headerMM-system9': css.raw({
    backgroundColor: 'treasuryHeaderSystem9',
  }),
};
