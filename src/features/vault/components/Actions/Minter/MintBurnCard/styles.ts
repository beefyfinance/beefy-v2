import { css } from '@repo/styles/css';

export const styles = {
  cardContent: css.raw({
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'background.content',
    borderRadius: '0 0 12px 12px',
    padding: '16px',
    sm: {
      padding: '24px',
    },
  }),
  content: css.raw({
    color: 'text.middle',
  }),
  btn: css.raw({
    _disabled: {
      backgroundColor: 'minterButtonDisabledBackground',
    },
  }),
  inputContainer: css.raw({
    margin: '24px 0',
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
    padding: '4px 12px',
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
  balances: css.raw({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  }),
  label: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
  }),
  value: css.raw({
    textStyle: 'body.sm',
    color: 'text.middle',
    textTransform: 'none',
  }),
  customDivider: css.raw({
    display: 'flex',
    alignItems: 'center',
    '& img': {
      margin: '0 12px',
    },
  }),
  line: css.raw({
    height: '2px',
    width: '100%',
    backgroundColor: 'background.content.light',
    borderRadius: '8px',
  }),
  boxReminder: css.raw({
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '16px',
    padding: '16px',
    borderRadius: '4px',
    backgroundColor: 'background.content.light',
  }),
  boxReserves: css.raw({
    textStyle: 'subline',
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '16px',
    padding: '16px',
    borderRadius: '4px',
    backgroundColor: 'background.content.light',
  }),
  reservesText: css.raw({
    color: 'text.dark',
    marginRight: '4px',
  }),
  amountReserves: css.raw({
    marginLeft: '4px',
    color: 'text.middle',
  }),
  noReserves: css.raw({
    marginTop: '16px',
  }),
};
