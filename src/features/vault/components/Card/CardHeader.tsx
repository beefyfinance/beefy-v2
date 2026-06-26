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
    gap: '8px',
    width: '100%',
  },
  variants: {
    padding: {
      none: {},
      default: {
        padding: '16px',
        sm: {
          padding: '24px',
        },
      },
    },
  },
  defaultVariants: {
    padding: 'default',
  },
});
