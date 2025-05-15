import { cva, type RecipeVariantProps } from '@repo/styles/css';
import { memo } from 'react';
import { selectTokenPriceByTokenOracleId } from '../../../../features/data/selectors/tokens.ts';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import type { Token } from './config.ts';
import { Icon } from './Icon.tsx';

const tokenPriceRecipe = cva({
  base: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'flex-start',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    color: 'text.light',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    transform: 'rotateX(0deg)',
    transition: 'transform 0.5s ease-in-out',
    lg: {
      justifyContent: 'center',
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

type TokenPriceRecipeProps = Exclude<RecipeVariantProps<typeof tokenPriceRecipe>, undefined>;

type TokenPriceProps = {
  token: Token;
} & TokenPriceRecipeProps;

export const TokenPrice = memo(function TokenPrice({ token, ...rest }: TokenPriceProps) {
  const { symbol, oracleId, icon } = token;
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, oracleId));

  return (
    <div className={tokenPriceRecipe(rest)}>
      <Icon alt={symbol} src={icon} />
      {formatLargeUsd(price, { decimalsUnder: 2 })}
    </div>
  );
});
