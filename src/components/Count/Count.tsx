import { styled } from '@repo/styles/jsx';

export const Count = styled('span', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: '0',
    flexGrow: '0',
    width: '20px',
    height: '20px',
    '&:before': {
      boxShadow:
        '0px 24.3px 36px 0px rgba(0, 0, 0, 0.40), 0px 7.326px 10.853px 0px rgba(0, 0, 0, 0.26), 0px 3.043px 4.508px 0px rgba(0, 0, 0, 0.20), 0px 1.1px 1.63px 0px rgba(0, 0, 0, 0.14)',
      textStyle: 'body.sm.medium',
      content: 'attr(data-count)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: '0',
      flexGrow: '0',
      backgroundColor: 'gold.80-32',
      width: '20px',
      height: '20px',
      borderRadius: '3.6px',
      color: 'text.boosted',
    },
  },
});
