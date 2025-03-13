import { css } from '@repo/styles/css';

export const styles = {
  icon: css.raw({
    marginRight: '8px',
  }),
  badge: css.raw({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: '0',
    flexGrow: '0',
    width: '24px',
    height: '24px',
    marginRight: '8px',
    '&:before': {
      textStyle: 'body.sm.medium',
      content: 'attr(data-count)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: '0',
      flexGrow: '0',
      backgroundColor: 'indicators.error',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      color: 'text.lightest',
    },
  }),
};
