import { cva } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { ExternalLink } from '../../../Links/ExternalLink.tsx';

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
    height: '32px',
    width: '30px',
    _hover: {
      color: 'text.light',
      backgroundColor: 'background.content',
    },
  },
  variants: {
    link: {
      true: {
        color: 'text.black',
        width: 'auto',
        backgroundColor: 'green.40',
        padding: '3px 12px',
        _hover: {
          color: 'text.black',
          backgroundColor: 'green.20',
        },
      },
    },
  },
});

export const ActionButton = styled('button', actionRecipe, {
  defaultProps: {
    type: 'button',
  },
});

export const ActionLink = styled(ExternalLink, actionRecipe);
