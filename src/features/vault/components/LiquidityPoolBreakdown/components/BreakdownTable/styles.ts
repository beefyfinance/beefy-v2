import { css } from '@repo/styles/css';

export const styles = {
  table: css.raw({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    justifyContent: 'center',
    background: 'background.content',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    lg: {
      borderBottomLeftRadius: '0',
    },
  }),
  cell: css.raw({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&:nth-child(2), &:nth-child(3)': {
      textAlign: 'right',
    },
  }),
  row: css.raw({
    backgroundColor: 'background.content',
    display: 'grid',
    gridTemplateColumns: '35fr 35fr 30fr',
    padding: '16px',
    borderBottom: 'solid 2px {colors.bayOfMany}',
    alignItems: 'center',
    columnGap: '16px',
    '&:last-child': {
      borderBottom: '0',
    },
    sm: {
      padding: '16px 24px',
    },
  }),
  header: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
  }),
  footer: css.raw({
    backgroundColor: 'background.content.light',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    lg: {
      borderBottomLeftRadius: '0',
    },
  }),
  asset: css.raw({
    display: 'flex',
    alignItems: 'center',
  }),
  icon: css.raw({
    width: '32px',
    height: '32px',
    marginRight: '8px',
  }),
  tokenAmount: css.raw({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    width: 'min-content',
    maxWidth: '100%',
    marginLeft: 'auto',
  }),
};
