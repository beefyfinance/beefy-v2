import { memo } from 'react';
import { selectTokenPriceByTokenOracleId } from '../../../../features/data/selectors/tokens.ts';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import type { Token } from './config.ts';
import { Icon } from './Icon.tsx';
import { styled } from '@repo/styles/jsx';

type TokenPriceProps = {
  token: Token;
  mode: 'current' | 'next' | 'hidden';
};

export const TokenPrice = memo(function TokenPrice({ token, mode }: TokenPriceProps) {
  const { symbol, oracleId, icon } = token;
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, oracleId));

  return (
    <TokenPriceContainer mode={mode}>
      <Icon price={true} alt={symbol} src={icon} />
      {formatLargeUsd(price, { decimalsUnder: 2 })}
    </TokenPriceContainer>
  );
});

const TokenPriceContainer = styled('div', {
  base: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-start',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    color: 'text.light',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    transform: 'rotateX(0deg)',
    transition: 'transform 0.5s ease-in-out',
    gridArea: 'content',
    paddingBlock: '2px',
    lg: {
      justifyContent: 'center',
      gap: '5px',
    },
  },
  variants: {
    mode: {
      current: {
        transform: 'rotateX(0deg)',
        zIndex: '[2]',
      },
      next: {
        transform: 'rotateX(90deg)',
        zIndex: '[1]',
      },
      hidden: {
        transform: 'rotateX(90deg)',
      },
    },
  },
  defaultVariants: {
    mode: 'hidden',
  },
});
