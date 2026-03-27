import { css } from '@repo/styles/css';

export const buildLpLink = css.raw({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'background.content.light',
  borderRadius: '0px 0px 8px 8px',
  padding: '16px 24px',
  textDecoration: 'none',
});

export const listItemArrow = css.raw({
  color: 'inherit',
  flexShrink: 0,
});

export const selectListScrollable = css.raw({
  flexGrow: 1,
  height: '100%',
});
