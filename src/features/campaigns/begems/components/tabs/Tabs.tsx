import { styled } from '@repo/styles/jsx';

export const Tabs = styled('div', {
  base: {
    background: 'darkBlue.60',
    borderTopRadius: '12px',
    contain: 'paint',
    display: 'flex',
    flexDirection: 'row',
    gap: '1px',
  },
});

export const TabsShadow = styled('div', {
  base: {
    position: 'relative',
    zIndex: '[1]',
    boxShadow:
      '0px 6px 12px 0px rgba(0, 0, 0, 0.40), 0px 4px 6px 0px rgba(0, 0, 0, 0.26), 0px 1px 2px 0px rgba(0, 0, 0, 0.20)',
  },
});
