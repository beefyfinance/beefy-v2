import { cva } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';

const actionRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: '4px',
    borderRadius: '4px',
    border: `none`,
    color: 'text.light',
    textDecoration: 'none',
    backgroundColor: 'background.border',
    boxShadow: 'none',
    outline: 'none',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
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
