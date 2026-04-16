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
};
export const TokenAmountIcon = memo(function TokenAmountIcon({
  amount,
  tokenAddress,
  chainId,
  css: cssProp,
  showSymbol = true,
  tokenImageSize = 24,
  amountWithValueCss,
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
      amount={<TokenAmount amount={amount} decimals={token.decimals} css={amountTextStyle} />}
      value={formatLargeUsd(valueInUsd)}
      tokenSymbol={showSymbol ? token.symbol : null}
      tokenIcon={
        <TokensImageWithChain
          tokens={[token]}
          chainId={token.chainId}
          css={iconStyle}
          size={tokenImageSize}
        />
      }
    />
  );
});

export type TokenAmountIconLoaderProps = {
  css?: CssStyles;
};
export const TokenAmountIconLoader = memo(function TokenAmountIconLoader({
  css: cssProp,
}: TokenAmountIconLoaderProps) {
  return (
    <TokenAmountIconComponent
      css={cssProp}
      amount={<TextLoader placeholder="1234.5678" />}
      value={<TextLoader placeholder="~$1245.56" />}
      tokenSymbol={<TextLoader placeholder="ABC-XYZ LP" />}
      tokenIcon={<IconLoader size={32} />}
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
};
const TokenAmountIconComponent = memo(function TokenAmountIconComponent({
  amount,
  value,
  tokenSymbol,
  tokenIcon,
  css: cssProp,
  amountWithValueCss,
}: TokenAmountIconComponentProps) {
  return (
    <Holder css={cssProp}>
      <AmountWithValue css={amountWithValueCss}>
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
    background: 'background.content.light',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
});

const AmountWithValue = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
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

const iconStyle = css.raw({
  width: '32px',
  height: '32px',
});
