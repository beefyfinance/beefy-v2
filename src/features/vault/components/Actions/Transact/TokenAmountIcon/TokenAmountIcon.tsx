import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import { IconLoader } from '../../../../../../components/IconLoader/IconLoader.tsx';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { TokensImageWithChain } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../../../../data/selectors/tokens.ts';

export type TokenAmountIconProps = {
  amount: BigNumber;
  tokenAddress: TokenEntity['address'];
  chainId: TokenEntity['chainId'];
  css?: CssStyles;
  showSymbol?: boolean;
  tokenImageSize?: number;
  amountWithValueCss?: CssStyles;
  variant?: 'card' | 'bare';
  /** icon+symbol on left instead of right */
  reverse?: boolean;
};
export const TokenAmountIcon = memo(function TokenAmountIcon({
  amount,
  tokenAddress,
  chainId,
  css: cssProp,
  showSymbol = true,
  tokenImageSize = 24,
  amountWithValueCss,
  variant = 'card',
  reverse = false,
}: TokenAmountIconProps) {
  const token = useAppSelector(state => selectTokenByAddress(state, chainId, tokenAddress));
  const tokenPrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, chainId, tokenAddress)
  );
  const valueInUsd = useMemo(() => {
    return amount.multipliedBy(tokenPrice);
  }, [amount, tokenPrice]);

  return (
    <TokenAmountIconComponent
      css={cssProp}
      amountWithValueCss={amountWithValueCss}
      variant={variant}
      reverse={reverse}
      amount={<TokenAmount amount={amount} decimals={token.decimals} css={amountTextStyle} />}
      value={formatLargeUsd(valueInUsd)}
      tokenSymbol={showSymbol ? token.symbol : null}
      tokenIcon={
        <TokensImageWithChain tokens={[token]} chainId={token.chainId} size={tokenImageSize} />
      }
    />
  );
});

export type TokenAmountIconLoaderProps = Pick<
  TokenAmountIconProps,
  'css' | 'showSymbol' | 'tokenImageSize' | 'amountWithValueCss' | 'variant' | 'reverse'
>;
export const TokenAmountIconLoader = memo(function TokenAmountIconLoader({
  tokenImageSize = 24,
  ...rest
}: TokenAmountIconLoaderProps) {
  return (
    <TokenAmountIconComponent
      {...rest}
      amount={<TextLoader placeholder="1234.5678" />}
      value={<TextLoader placeholder="~$1245.56" />}
      tokenSymbol={<TextLoader placeholder="ABC-XYZ LP" />}
      tokenIcon={<IconLoader size={tokenImageSize} />}
    />
  );
});

type TokenAmountIconComponentProps = {
  amount: ReactNode;
  value: ReactNode;
  tokenSymbol?: ReactNode;
  tokenIcon?: ReactNode;
  css?: CssStyles;
  amountWithValueCss?: CssStyles;
  variant?: 'card' | 'bare';
  reverse?: boolean;
};
const TokenAmountIconComponent = memo(function TokenAmountIconComponent({
  amount,
  value,
  tokenSymbol,
  tokenIcon,
  css: cssProp,
  amountWithValueCss,
  variant = 'card',
  reverse = false,
}: TokenAmountIconComponentProps) {
  return (
    <Holder css={cssProp} variant={variant} reverse={reverse}>
      <AmountWithValue css={amountWithValueCss} reverse={reverse}>
        {amount}
        <Value>{value}</Value>
      </AmountWithValue>
      <TokenWithIcon>
        {tokenSymbol && <Token>{tokenSymbol}</Token>}
        {tokenIcon}
      </TokenWithIcon>
    </Holder>
  );
});

const Holder = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  variants: {
    variant: {
      card: {
        background: 'background.content.light',
        borderRadius: '8px',
        padding: '8px 12px',
      },
      bare: {},
    },
    reverse: {
      true: {
        flexDirection: 'row-reverse',
      },
      false: {},
    },
  },
});

const AmountWithValue = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
  variants: {
    reverse: {
      true: {
        alignItems: 'flex-end',
      },
      false: {},
    },
  },
});

const Value = styled('div', {
  base: {
    textStyle: 'body.sm',
    color: 'text.dark',
  },
});

const TokenWithIcon = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const Token = styled('span', {
  base: {
    textStyle: 'body.medium',
    color: 'text.light',
  },
});

const amountTextStyle = css.raw({
  textStyle: 'body.medium',
  color: 'text.light',
});
