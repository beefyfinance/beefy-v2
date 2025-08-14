import { cva } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';

const actionRecipe = cva({
  base: {
    textStyle: 'body.md.medium',
    letterSpacing: '0',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: '4px',
    border: `none`,
    color: 'text.dark',
    textDecoration: 'none',
    backgroundColor: 'background.content.dark',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    height: '28px',
    width: '30px',
  },
  variants: {
    link: {
      true: {
        color: 'text.black',
        width: 'auto',
        backgroundColor: 'green.40',
        padding: '3px 12px',
      },
    },
  },
});

export const ActionButton = styled('button', actionRecipe, {
  defaultProps: {
    type: 'button',
  },
});

export const ActionLink = styled('a', actionRecipe, {
  defaultProps: {
    target: '_blank',
    rel: 'noopener',
  },
});
