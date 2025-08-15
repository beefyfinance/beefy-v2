import { memo, useEffect, useState } from 'react';
import { TokenPrice } from './TokenPrice.tsx';
import { styled } from '@repo/styles/jsx';
import { tokens } from './config.ts';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';
import ExpandMore from '../../../../images/icons/mui/ExpandMore.svg?react';
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
    <MobileTrigger variant="transparent" borderless={true} onClick={() => setOpen(true)}>
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
    <PriceContainer>
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
    </PriceContainer>
  );
});

const ArrowIcon = styled(ExpandMore, {
  base: {
    transform: 'rotate(0deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.dark',
    height: '16px',
    width: '16px',
  },
  variants: {
    isOpen: {
      true: {
        color: 'text.light',
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
      height: '40px',
      paddingBlock: '8px',
      paddingInline: '12px',
      color: 'text.dark',
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
    border: 'none',
    paddingBlock: '0',
    paddingInline: '0',
  },
});

const PriceContainer = styled('div', {
  base: {
    display: 'grid',
    gridTemplateAreas: '"content"',
    placeItems: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
});
