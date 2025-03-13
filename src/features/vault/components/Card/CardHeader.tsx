import { styled } from '@repo/styles/jsx';

export const CardHeader = styled('div', {
  base: {
    backgroundColor: 'background.content.dark',
    borderTopRadius: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    gap: '8px',
    width: '100%',
    sm: {
      padding: '24px',
    },
  },
});
