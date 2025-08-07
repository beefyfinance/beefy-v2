import { cva } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';

const actionRecipe = cva({
  base: {
    textStyle: 'body',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: '4px',
    borderRadius: '4px',
    border: `none`,
    color: 'text.dark',
    textDecoration: 'none',
    backgroundColor: 'background.content.dark',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    height: '28px',
    width: '28px',
  },
  variants: {
    link: {
      true: {
        color: 'text.black',
        width: '62px',
        backgroundColor: 'green.40',
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
