import { css } from '@repo/styles/css';

export const styles = {
  sortColumn: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    textAlign: 'right',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: '0',
    cursor: 'pointer',
  }),
  sortTooltipIcon: css.raw({
    width: '20px',
    height: '20px',
    flexShrink: '0',
    marginLeft: '4px',
    '& svg': {
      width: '20px',
      height: '20px',
    },
  }),
  sortIcon: css.raw({
    marginLeft: '8px',
    width: '9px',
    height: '12px',
    fill: 'currentColor',
    display: 'block',
  }),
  sortIconHighlight: css.raw({
    fill: 'text.light',
  }),
};
