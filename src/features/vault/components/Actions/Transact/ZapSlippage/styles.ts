import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),
  titleToggle: css.raw({
    textStyle: 'body',
    color: 'text.dark',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    background: 'transparent',
    padding: '0',
    margin: '0',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
  }),
  title: css.raw({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }),
  valueIcon: css.raw({
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  }),
  value: css.raw({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }),
  warning: css.raw({
    color: 'indicators.warning',
  }),
  danger: css.raw({
    color: 'indicators.error',
  }),
  selector: css.raw({
    border: '2px solid bayOfMany',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  }),
  option: css.raw({
    textStyle: 'body',
    color: 'text.dark',
    flexBasis: 'auto',
    flexShrink: '0',
    flexGrow: '1',
    borderRadius: '8px',
    background: 'transparent',
    padding: '6px 16px',
    margin: '0',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: 'background.content.light',
    },
    '&:first-child': {
      borderTopLeftRadius: '0',
      borderBottomLeftRadius: '0',
    },
    '&:last-child': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0',
    },
  }),
  button: css.raw({
    cursor: 'pointer',
  }),
  selected: css.raw({
    color: 'text.light',
    backgroundColor: 'background.content.light',
  }),
  custom: css.raw({
    width: '5em',
    flexShrink: '0',
    flexGrow: '2',
    position: 'relative',
  }),
  customPlaceholder: css.raw({
    cursor: 'pointer',
    textAlign: 'center',
    color: 'text.dark',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    borderTopRightRadius: '0',
    borderBottomRightRadius: '0',
  }),
  customInput: css.raw({
    textAlign: 'center',
    width: '100%',
    color: 'text.light',
  }),
  customHidden: css.raw({
    opacity: '0',
    pointerEvents: 'none',
  }),
};
