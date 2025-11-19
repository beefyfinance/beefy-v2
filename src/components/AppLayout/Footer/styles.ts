import { css } from '@repo/styles/css';

export const styles = {
  wrapper: css.raw({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'background.body',
  }),
  wrapperTop: css.raw({
    marginBottom: 'auto',
  }),
  footer: css.raw({
    background: 'background.header',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: '32px',
  }),
  nav: css.raw({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '0',
    margin: '0 -12px -12px -12px',
    listStyle: 'none',
  }),
  navItem: css.raw({
    margin: '0 12px 12px 12px',
  }),
  navLink: css.raw({
    textStyle: 'body.medium',
    display: 'block',
    textDecoration: 'none',
    color: 'text.middle',
    '& svg': {
      display: 'block',
      fill: 'currentColor',
      width: '24px',
      height: '24px',
    },
    '&:hover': {
      color: 'text.light',
    },
  }),
};
