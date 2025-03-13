import { css } from '@repo/styles/css';

export const styles = {
  itemsContainer: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
    width: '100%',
  }),
  item: css.raw({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: '4px',
  }),
  square: css.raw({
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  }),
  label: css.raw({
    textStyle: 'body.sm.medium',
    color: 'text.middle',
    textTransform: 'uppercase',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '90%',
  }),
  value: css.raw({
    textStyle: 'body.sm',
    color: 'text.dark',
  }),
  flex: css.raw({
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  }),
};
