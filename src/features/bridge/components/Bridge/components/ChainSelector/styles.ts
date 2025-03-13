import { css } from '@repo/styles/css';

export const styles = {
  labels: css.raw({
    display: 'flex',
    marginBottom: '4px',
  }),
  label: css.raw({
    textStyle: 'subline.sm',
    fontWeight: 'bold',
    color: 'text.dark',
    flex: '1 1 40%',
  }),
  buttons: css.raw({
    display: 'flex',
    padding: '0 8px',
    background: 'purpleDarkest',
    borderRadius: '8px',
  }),
  btn: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    padding: '0',
    margin: '0',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    color: 'text.middle',
    background: 'purpleDarkest',
  }),
  arrowButton: css.raw({
    width: '24px',
    flex: '0 0 24px',
    background: 'purpleDarkest',
    '&:hover > .arrow-button-arrow': {
      transform: 'rotateY(180deg)',
    },
  }),
  arrow: css.raw({
    transition: 'transform 0.2s ease-in-out',
    display: 'flex',
    width: '24px',
    '&::after': {
      content: '""',
      display: 'block',
      borderLeft: '12px solid {colors.background.content}',
      borderTop: '20px solid transparent',
      borderBottom: '20px solid transparent',
    },
  }),
  arrowInner: css.raw({
    width: '12px',
    background: 'background.content',
    '&::before': {
      content: '""',
      display: 'block',
      borderLeft: '12px solid {colors.purpleDarkest}',
      borderTop: '20px solid transparent',
      borderBottom: '20px solid transparent',
    },
  }),
  chain: css.raw({
    flex: '1 1 20%',
    padding: '8px 8px',
    justifyContent: 'flex-start',
    '&:hover': {
      color: 'text.lightest',
    },
  }),
  icon: css.raw({
    marginRight: '8px',
  }),
  from: css.raw({
    borderRadius: '8px 0 0 8px',
  }),
  to: css.raw({
    borderRadius: '0 8px 8px 0',
  }),
};
