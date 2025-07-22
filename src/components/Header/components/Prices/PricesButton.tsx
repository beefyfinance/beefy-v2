import { memo, useEffect, useState } from 'react';
import { TokenPrice } from './TokenPrice.tsx';
import { styled } from '@repo/styles/jsx';
import { tokens } from './config.ts';
import { DropdownTrigger } from '../../../Dropdown/DropdownTrigger.tsx';
import ArrangeArrowIcon from '../../../../images/icons/arrange-arrow.svg?react';

export const PricesButton = memo(function PricesButton({ isOpen }: { isOpen: boolean }) {
  const [current, setCurrent] = useState(0);
  const next = current < tokens.length - 1 ? current + 1 : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(i => (i < tokens.length - 1 ? i + 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, [setCurrent]);

  return (
    <Trigger>
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

      <ArrowIcon isOpen={isOpen} />
    </Trigger>
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
