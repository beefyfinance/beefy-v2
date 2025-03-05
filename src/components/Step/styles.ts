import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({
    background: 'background.content',
    borderRadius: '12px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  }),
  titleBar: css.raw({
    textStyle: 'body.medium',
    color: 'text.middle',
    background: 'background.content.dark',
    padding: '24px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    borderBottom: 'solid 2px {colors.bayOfMany}',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
  }),
  backButton: css.raw({
    margin: '0',
    padding: '0',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    background: 'bayOfMany',
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',
    color: 'text.light',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  backIcon: css.raw({
    fill: 'text.light',
    width: '12px',
    height: '9px',
  }),
  adornment: css.raw({
    marginLeft: 'auto',
  }),
  tokenIcon: css.raw({
    flexShrink: '0',
    flexGrow: '0',
    marginRight: '8px',
  }),
  content: css.raw({
    padding: '24px',
    height: '462px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
  }),
  noPadding: css.raw({
    padding: '0',
  }),
};
