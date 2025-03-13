import { css } from '@repo/styles/css';

export const styles = {
  rows: css.raw({
    textStyle: 'body',
    display: 'grid',
    rowGap: '8px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  }),
  label: css.raw({
    color: 'colorPalette.text.label',
    '&:nth-last-child(2)': {
      fontWeight: 'medium',
      color: 'colorPalette.text.title',
    },
  }),
  value: css.raw({
    color: 'colorPalette.text.item',
    textAlign: 'right',
    '&:last-child': {
      fontWeight: 'medium',
      color: 'colorPalette.text.label',
    },
  }),
};
