import { styled } from '@repo/styles/jsx';

export const Panel = styled('div', {
  base: {
    width: '276px',
  },
});

export const PanelHeader = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.light',
    display: 'flex',
    alignItems: 'center',
    padding: `${12 - 2}px`,
    backgroundColor: 'background.content.dark',
    borderRadius: '8px 8px 0px 0px',
    gap: '8px',
  },
});

export const PanelTitle = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
  },
});

export const PanelBackButton = styled(
  'button',
  {
    base: {
      color: 'text.light',
      background: 'bayOfMany',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      flexShrink: 0,
      flexGrow: 0,
      _hover: {
        color: 'text.light',
        cursor: 'pointer',
      },
    },
  },
  {
    defaultProps: {
      type: 'button',
    },
  }
);

export const PanelCloseButton = styled(
  'button',
  {
    base: {
      color: 'text.dark',
      marginLeft: 'auto',
      _hover: {
        color: 'text.light',
        cursor: 'pointer',
      },
    },
  },
  {
    defaultProps: {
      type: 'button',
    },
  }
);

export const PanelContent = styled('div', {
  base: {
    height: '356px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
});
