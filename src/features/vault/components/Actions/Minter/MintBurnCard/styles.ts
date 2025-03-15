import { css } from '@repo/styles/css';

export const styles = {
  header: css.raw({
    backgroundColor: 'background.content.dark',
    borderRadius: '12px',
  }),
  tabs: css.raw({
    backgroundColor: 'background.content.dark',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(50%, 1fr))',
  }),
  tab: css.raw({
    borderBottom: 'solid 2px transparent',
    color: 'text.dark',
    background: 'none',
    padding: '0',
    margin: '0',
    height: '56px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    borderBottomLeftRadius: '0',
    borderBottomRightRadius: '0',
    '&:first-child:last-child': {
      pointerEvents: 'none',
    },
    '&:hover': {
      background: 'none',
    },
  }),
  selected: css.raw({
    color: 'text.light',
    borderBottom: 'solid 2px {colors.text.dark}',
  }),
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
  logo: css.raw({
    height: '50px',
  }),
  content: css.raw({
    color: 'text.middle',
  }),
  btn: css.raw({
    color: 'text.light',
    backgroundColor: 'bayOfMany',
    padding: '12px 24px',
    borderRadius: '8px',
    _disabled: {
      backgroundColor: 'minterButtonDisabledBackground',
    },
  }),
  info: css.raw({
    display: 'flex',
    marginBottom: '16px',
  }),
  info2: css.raw({
    marginBottom: '24px',
  }),
  item: css.raw({
    marginRight: '32px',
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
