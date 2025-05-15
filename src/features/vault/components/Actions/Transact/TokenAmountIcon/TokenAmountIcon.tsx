import { css, type CssStyles } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import { IconLoader } from '../../../../../../components/IconLoader/IconLoader.tsx';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { TokenImage } from '../../../../../../components/TokenImage/TokenImage.tsx';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../../../../data/selectors/tokens.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

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
      amount={<TokenAmount amount={amount} decimals={token.decimals} css={styles.token} />}
      value={`~${formatLargeUsd(valueInUsd)}`}
      tokenSymbol={showSymbol ? token.symbol : null}
      tokenIcon={
        <TokenImage
          chainId={token.chainId}
          address={token.address}
          css={styles.icon}
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
  const classes = useStyles();
  return (
    <div className={css(styles.holder, cssProp)}>
      <div className={css(styles.amountWithValue, amountWithValueCss)}>
        {amount}
        <div className={classes.value}>{value}</div>
      </div>
      <div className={classes.tokenWithIcon}>
        {tokenSymbol && <span className={classes.token}>{tokenSymbol}</span>}
        {tokenIcon}
      </div>
    </div>
  );
});
