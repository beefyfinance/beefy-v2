import type { ReactNode } from 'react';
import { memo } from 'react';
import BackArrow from '../../../../../../images/back-arrow.svg?react';
import { styled } from '@repo/styles/jsx';

export type StepHeaderProps = {
  onBack?: () => void;
  children: ReactNode;
};
export const StepHeader = memo(function StepHeader({ onBack, children }: StepHeaderProps) {
  return (
    <HeaderTitle>
      {onBack ?
        <BackButton type="button" onClick={onBack}>
          <BackIcon />
        </BackButton>
      : null}
      {children}
    </HeaderTitle>
  );
});

const HeaderTitle = styled('div', {
  base: {
    textStyle: 'body.medium',
    position: 'relative',
    color: 'text.middle',
    background: 'background.content.dark',
    padding: '16px 16px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
    display: 'flex',
    columnGap: '12px',
    alignItems: 'center',
    sm: {
      padding: '16px 24px',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '0',
      bottom: '0',
      right: '0',
      height: '2px',
      background: 'bayOfMany',
    },
  },
});

const BackButton = styled('button', {
  base: {
    margin: '0',
    padding: '0',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    background: 'bayOfMany',
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',
    color: 'text.light',
    flexShrink: '0',
    flexGrow: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const BackIcon = styled(BackArrow, {
  base: {
    color: 'text.light',
    width: '12px',
    height: '9px',
  },
});
