import { styled } from '@repo/styles/jsx';
import { Button } from '../../Button/Button.tsx';

export const SelectButton = styled(
  Button,
  {
    base: {
      gap: '4px',
      justifyContent: 'flex-start',
      textAlign: 'left',
    },
    variants: {
      selected: {
        true: {},
      },
      active: {
        true: {},
      },
      variant: {
        filter: {
          color: 'text.middle',
        },
      },
    },
  },
  {
    defaultProps: {
      size: 'sm',
    },
  }
);
