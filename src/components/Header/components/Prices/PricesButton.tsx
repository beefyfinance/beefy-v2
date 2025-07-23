import { memo, useEffect, useState } from 'react';
import { TokenPrice } from './TokenPrice.tsx';
import { styled } from '@repo/styles/jsx';
import { tokens } from './config.ts';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';
import ArrangeArrowIcon from '../../../../images/icons/arrange-arrow.svg?react';
import { Button } from '../../../Button/Button.tsx';

export const PricesButtonDesktop = memo(function PricesButton({ isOpen }: { isOpen: boolean }) {
  return (
    <Trigger>
      <Price />
      <ArrowIcon isOpen={isOpen} />
    </Trigger>
  );
});

export const PricesButtonMobile = memo(function PricesButtonMobile({
  setOpen,
}: {
  setOpen: (setter: boolean | ((open: boolean) => boolean)) => void;
}) {
  return (
    <MobileTrigger borderless={true} onClick={() => setOpen(true)}>
      <Price />
    </MobileTrigger>
  );
});

const Price = memo(function Price() {
  const [current, setCurrent] = useState(0);
  const next = current < tokens.length - 1 ? current + 1 : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(i => (i < tokens.length - 1 ? i + 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, [setCurrent]);

  return (
    <>
      {tokens.map((token, i) => (
        <TokenPrice
          key={i}
          token={token}
          mode={
            i === current ? 'current'
            : i === next ?
              'next'
            : 'hidden'
          }
        />
      ))}
    </>
  );
});

const ArrowIcon = styled(ArrangeArrowIcon, {
  base: {
    transform: 'rotate(180deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  variants: {
    isOpen: {
      true: {
        transform: 'rotate(0deg)',
      },
    },
  },
});

const Trigger = styled(
  DropdownTrigger.button,
  {
    base: {
      cursor: 'pointer',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100px',
      height: '40px',
      gap: '2px',
      padding: '8px 12px',
      position: 'relative',
    },
  },
  {
    defaultProps: {
      type: 'button',
    },
  }
);

const MobileTrigger = styled(Button, {
  base: {
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '0',
    position: 'relative',
    _hover: {
      backgroundColor: 'transparent',
    },
  },
});
