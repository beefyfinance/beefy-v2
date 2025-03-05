import { css } from '@repo/styles/css';

export const styles = {
  successContent: css.raw({
    backgroundColor: 'extracted1431o14',
  }),
  errorContent: css.raw({
    backgroundColor: 'extracted1401',
  }),
  content: css.raw({
    marginTop: '12px',
    padding: '16px',
    borderRadius: '4px',
    display: 'flex',
    maxWidth: '100%',
    flexDirection: 'column',
    gap: '16px',
  }),
  message: css.raw({
    color: 'blackMarket1',
    '& span': {
      fontWeight: 'medium',
    },
  }),
  messageHighlight: css.raw({
    color: 'blackMarket1',
    fontWeight: 'medium',
  }),
  friendlyMessage: css.raw({
    textStyle: 'body.medium',
    color: 'blackMarket1',
    marginBottom: '16px',
  }),
  closeBtn: css.raw({}),
  rememberContainer: css.raw({
    marginTop: '16px',
  }),
  dustContainer: css.raw({
    marginTop: '16px',
  }),
  icon: css.raw({
    height: '20px',
    marginRight: '8px',
  }),
  buttons: css.raw({
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
    width: '100%',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
  }),
  link: css.raw({
    textDecoration: 'none',
    color: 'green',
  }),
};
