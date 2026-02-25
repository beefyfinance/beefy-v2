import { styled } from '@repo/styles/jsx';

export const SelectListContainer = styled('div', {
  base: {
    padding: '24px 0 0 0',
    height: '469px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '0 0 12px 12px',
    overflow: 'hidden',
  },
});

export const SelectListSearch = styled('div', {
  base: {
    padding: '0 24px',
    margin: '0 0 24px 0',
  },
});

export const SelectListItems = styled('div', {
  base: {
    padding: '0 24px 24px 24px',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  variants: {
    noGap: {
      true: {
        gap: '0',
      },
    },
  },
});

export const SelectListNoResults = styled('div', {
  base: {
    padding: '8px 12px',
    borderRadius: '8px',
    background: 'background.content.light',
  },
});

export const ListItemButton = styled('button', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    color: 'text.middle',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    userSelect: 'none',
    outline: 'none',
    textAlign: 'left',
    height: '44px',
    '&:hover, &:focus-visible': {
      color: 'text.lightest',
      '& .list-item-arrow': {
        color: 'text.lightest',
      },
    },
  },
});

export const ListItemSide = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '8px',
  },
});

export const ListItemRightSide = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    flexShrink: 1,
    minWidth: '80px',
  },
});

export const ListItemName = styled('span', {
  base: {
    whiteSpace: 'nowrap',
  },
});

export const ListItemBalance = styled('span', {
  base: {
    color: 'inherit',
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const ListItemBalanceColumn = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0',
    flexShrink: 1,
    minWidth: 0,
  },
});

export const ListItemBalanceAmount = styled('span', {
  base: {
    color: 'inherit',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export const ListItemBalanceUsd = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export const ListItemTag = styled('div', {
  base: {
    textStyle: 'body.sm.medium',
    color: 'text.middle',
    background: 'bayOfMany',
    padding: '2px 8px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  },
});

export const WalletToggleRow = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    padding: '0 24px',
    margin: '0 0 16px 0',
  },
});

export const WalletToggleLabel = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.dark',
  },
});

export const WalletToggleDust = styled('div', {
  base: {
    textAlign: 'right',
  },
});

export const BuildLpContent = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    flex: '1',
    textDecoration: 'none',
  },
});

export const BuildLpIcon = styled('span', {
  base: {
    color: 'text.middle',
  },
});
