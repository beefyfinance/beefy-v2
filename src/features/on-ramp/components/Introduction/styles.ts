import { css } from '@repo/styles/css';

export const styles = {
  container: css.raw({}),
  title: css.raw({
    textStyle: 'h1',
    fontSize: '45px',
    lineHeight: '56px',
    color: 'text.light',
  }),
  text: css.raw({
    textStyle: 'body',
    color: 'text.middle',
    marginTop: '32px',
    '& p': {
      marginTop: '0',
      marginBottom: '1em',
      '&:last-child': {
        marginBottom: '0',
      },
    },
  }),
  poweredBy: css.raw({
    marginTop: '64px',
  }),
  poweredByLabel: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    marginTop: '32px',
  }),
  poweredByLogos: css.raw({
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  }),
};
