import { sva } from '@repo/styles/css';

export const refreshRecipe = sva({
  slots: ['container', 'button', 'icon'],
  base: {
    container: {},
    button: {
      textStyle: 'body.medium',
      color: 'text.dark',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '0',
      minWidth: '0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 'fit-content',
      margin: '0',
      padding: '0',
      cursor: 'pointer',
      userSelect: 'none',
      boxShadow: 'none',
      textAlign: 'center',
      textDecoration: 'none',
      outline: 'none',
      '&:focus': {
        outline: 'none',
      },
      '&:disabled,&:hover:disabled,&:active:disabled,&:focus:disabled': {
        pointerEvents: 'none',
      },
    },
    icon: {
      width: '20px',
      height: '20px',
    },
  },
  variants: {
    status: {
      loading: {
        icon: {
          color: 'text.dark',
          animationName: 'rotate',
          animationDuration: '3s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
        },
      },
      loaded: {
        container: {
          display: 'none',
        },
        icon: {
          color: 'indicators.success',
        },
      },
      error: {
        icon: {
          color: 'indicators.warning',
        },
      },
    },
    canLoad: {
      true: {
        container: {
          display: 'block',
        },
      },
    },
  },
  defaultVariants: {
    status: 'loaded',
    canLoad: false,
  },
});
