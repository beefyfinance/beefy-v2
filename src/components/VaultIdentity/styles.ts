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
    color: 'text.boosted',
  }),
  vaultNetwork: css.raw({
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    width: '28px',
    height: '28px',
    border: 'solid 2px {colors.background.content.dark}',
    backgroundColor: 'colorPalette.primary',
    borderBottomRightRadius: '16px',
    '& img': {
      width: '22px',
      height: '22px',
    },
  }),
  vaultNetworkGradient: css.raw({
    // panda seems to have token replacement bug here, so using css variables
    backgroundImage:
      'linear-gradient(90deg, var(--colors-color-palette-primary) 0%, var(--colors-color-palette-secondary, var(--colors-color-palette-primary)) 100%)',
  }),
};
