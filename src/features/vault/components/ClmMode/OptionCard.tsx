import { styled } from '@repo/styles/jsx';

// shared parts of the deposit rewards card and the withdraw side cards, so both tabs read as one family

export const OptionSection = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});

export const OptionHeading = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.dark',
  },
});

export const OptionCard = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    border: '1px solid {colors.background.content.light}',
    backgroundColor: 'background.content.dark',
  },
  variants: {
    checked: {
      true: {
        borderColor: 'transparent',
        backgroundColor: 'background.content.light',
      },
    },
    busy: {
      true: {
        opacity: '0.45',
        pointerEvents: 'none',
      },
    },
  },
});

/** fixed 44px gutter so the title starts at the same offset in every card */
export const OptionGlyph = styled('div', {
  base: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: '0',
    width: '44px',
    color: 'green.40',
  },
});

export const OptionBody = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexGrow: '1',
    minWidth: '0',
  },
});

export const OptionTitleRow = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
  },
});

export const OptionTitle = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.light',
  },
});

export const OptionNote = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
    textWrap: 'pretty',
  },
});
