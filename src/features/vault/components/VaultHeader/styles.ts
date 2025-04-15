import { css } from '@repo/styles/css';

export const styles = {
  header: css.raw({
    display: 'flex',
    lgDown: {
      display: 'block',
    },
  }),
  titleHolder: css.raw({
    display: 'flex',
    marginBottom: '8px',
    alignItems: 'center',
    gap: '8px 12px',
    flexGrow: '1',
    lg: {
      marginBottom: '0',
    },
  }),
  title: css.raw({
    textStyle: 'h1',
    color: 'text.middle',
  }),
  titleHolderClm: css.raw({
    smDown: {
      flexWrap: 'wrap',
    },
  }),
  titleAssetClm: css.raw({
    smDown: {
      width: '32px',
      height: '32px',
    },
  }),
  titleClm: css.raw({
    smDown: {
      width: '100%',
      order: '10',
    },
  }),
  titleBoost: css.raw({
    color: 'text.boosted',
  }),
  labelsHolder: css.raw({
    display: 'flex',
    rowGap: '24px',
    columnGap: '24px',
    alignItems: 'center',
    justifyContent: 'flex-end',
    lgDown: {
      justifyContent: 'flex-start',
    },
  }),
  platformLabel: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    '& span': {
      color: 'text.light',
      textTransform: 'uppercase',
    },
  }),
  shareHolder: css.raw({
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
    marginLeft: 'auto',
  }),
};
