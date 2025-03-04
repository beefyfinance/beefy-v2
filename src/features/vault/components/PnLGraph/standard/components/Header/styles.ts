import { css } from '@repo/styles/css';

export const styles = {
  header: css.raw({
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(4, 1fr)',
    mdDown: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  }),
  itemContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: '16px 24px',
    backgroundColor: 'background.content',
    mdDown: {
      padding: '16px',
    },
  }),

  label: css.raw({
    textStyle: 'body.sm.med',
    fontWeight: '700',
    color: 'text.dark',
    textTransform: 'uppercase',
  }),
  value: css.raw({
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    textStyle: 'body.med',
    color: 'text.middle',
    fontWeight: '500',
    '& span': {
      textDecoration: 'none',
      textStyle: 'subline.sm',
      color: 'text.dark',
      fontWeight: '700',
    },
  }),
  greenValue: css.raw({
    color: 'green',
  }),
  redValue: css.raw({
    color: 'indicators.error',
  }),
  subValue: css.raw({
    textStyle: 'body.sm.med',
    color: 'text.dark',
  }),
  withTooltip: css.raw({
    textDecoration: 'underline 1px dotted',
    cursor: 'default',
  }),
  textOverflow: css.raw({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }),
  labelContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
    columnGap: '4px',
    '& svg': {
      color: 'text.dark',
      height: '16px',
      width: '16px',
      '&:hover': {
        cursor: 'pointer',
      },
    },
  }),
  center: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
};
