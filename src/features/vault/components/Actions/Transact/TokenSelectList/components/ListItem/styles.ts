import { css } from '@repo/styles/css';

export const styles = {
  item: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    color: 'text.dark',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
    textAlign: 'left',
    '&:hover, &:focus-visible': {
      color: 'text.middle',
      '& .item-arrow': {
        color: 'text.lightest',
      },
    },
  }),
  side: css.raw({
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
  }),
  right: css.raw({
    flexShrink: '1',
    minWidth: '0',
  }),
  icon: css.raw({
    width: '24px',
    height: '24px',
  }),
  symbol: css.raw({
    whiteSpace: 'nowrap',
  }),
  tag: css.raw({
    textStyle: 'body.sm.medium',
    color: 'text.middle',
    background: 'bayOfMany',
    padding: '2px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  }),
  balance: css.raw({
    flexShrink: '1',
    minWidth: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  arrow: css.raw({
    color: 'text.middle',
    height: '24px',
    width: '8px',
    flexShrink: '0',
  }),
};
