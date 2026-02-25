import { cva } from '@repo/styles/css';

const navItemStyles = {
  base: {
    display: 'flex',
    textDecoration: 'none',
    color: 'text.dark',
    columnGap: '2px',
    outline: 'none',
    padding: '2px',
  },
  variants: {
    mobile: {
      true: {
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
      },
    },
    dropdownItem: {
      true: {
        padding: '8px 12px',
        _hover: {
          backgroundColor: 'background.button',
        },
      },
    },
  },
} as const;

export const navItemRecipe = cva(navItemStyles);

export const navLinkRecipe = cva({
  ...navItemStyles,
  base: {
    ...navItemStyles.base,
    _hover: {
      color: 'text.light',
      cursor: 'pointer',
    },
    _focus: {
      color: 'text.light',
    },
    _active: {
      color: 'text.light',
    },
  },
});
