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
  balance: css.raw({
    textStyle: 'body.sm',
    cursor: 'pointer',
    color: 'text.dark',
    '& span': {
      paddingLeft: '4px',
      fontWeight: 'medium',
      color: 'text.middle',
    },
  }),
  max: css.raw({
    textStyle: 'subline.sm',
    color: 'text.light',
    backgroundColor: 'bayOfMany',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '4px',
    margin: '0',
    padding: '6px 12px',
    minWidth: '0',
    flexShrink: '0',
    cursor: 'pointer',
    '&:disabled': {
      color: 'text.dark',
      backgroundColor: 'bayOfMany',
      borderColor: 'background.content.light',
      opacity: '0.4',
    },
  }),
};
