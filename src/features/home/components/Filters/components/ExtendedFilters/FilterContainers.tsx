import { styled } from '@repo/styles/jsx';
import { Button } from '../../../../../../components/Button/Button.tsx';
import ArrowBackIcon from '../../../../../../images/icons/chevron-right.svg?react';

export const ButtonLabelContainer = styled('div', {
  base: {
    display: 'flex',
    gap: '4px',
  },
});

export const Label = styled('span', {
  base: {
    color: 'text.light',
  },
});

export const ButtonFilter = styled(Button, {
  base: {
    justifyContent: 'space-between',
    paddingBlock: '14px',
    paddingInline: '16px',
    lg: {
      paddingBlock: '8px',
      paddingInline: '12px',
    },
  },
});

export const Title = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingRight: '8px',
  },
});

export const ArrowBack = styled(ArrowBackIcon, {
  base: {
    transform: 'rotate(180deg)',
    color: 'text.dark',
    height: '12px',
    _hover: {
      cursor: 'pointer',
      color: 'text.middle',
    },
  },
});

export const ContentHeader = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
});

export const MobileContentBox = styled('div', {
  base: {
    background: 'background.content.dark',
    borderRadius: '8px',
    padding: '6px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  variants: {
    size: {
      sm: {
        padding: '4px 16px',
      },
    },
  },
});

export const MobileContentContainer = styled('div', {
  base: {
    backgroundColor: 'background.content.dark',
    borderRadius: '8px',
    height: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
  },
});

export const IconContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
  },
});
