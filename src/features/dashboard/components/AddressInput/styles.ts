import { styled } from '@repo/styles/jsx';

export const IconButton = styled('button', {
  base: {
    background: 'transparent',
    padding: '0',
    border: '0',
    boxShadow: 'none',
    lineHeight: 'inherit',
    display: 'flex',
    alignItems: 'center',
    flexShrink: '0',
    width: '20px',
    height: '20px',
    opacity: '0.64',
    cursor: 'pointer',
  },
  variants: {
    state: {
      active: {
        color: 'text.light',
      },
      disabled: {
        color: 'text.dark',
      },
    },
    enter: {
      true: {
        borderRadius: '4px',
        border: '1px solid {text.light}',
      },
    },
  },
  defaultVariants: {
    state: 'disabled',
  },
});

export const IconDiv = styled('div', {
  base: {
    background: 'transparent',
    padding: '0',
    lineHeight: 'inherit',
    display: 'flex',
    alignItems: 'center',
    flexShrink: '0',
    width: '20px',
    height: '20px',
    opacity: '0.64',
  },
  variants: {
    state: {
      active: {
        color: 'text.light',
      },
      disabled: {
        color: 'text.dark',
      },
    },
  },
  defaultVariants: {
    state: 'disabled',
  },
});

export const LoaderContainer = styled('div', {
  base: {
    display: 'flex',
    color: 'text.dark',
  },
});
