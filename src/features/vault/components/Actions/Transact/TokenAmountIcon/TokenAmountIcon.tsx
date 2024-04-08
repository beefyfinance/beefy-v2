import type { ReactNode } from 'react';
import { memo, useMemo } from 'react';
import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../../../../data/entities/token';
import { useAppSelector } from '../../../../../../store';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../../../../data/selectors/tokens';
import { TokenAmount } from '../../../../../../components/TokenAmount';
import { formatBigUsd } from '../../../../../../helpers/format';
import { TokenImage } from '../../../../../../components/TokenImage/TokenImage';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { TextLoader } from '../../../../../../components/TextLoader';
import { IconLoader } from '../../../../../../components/IconLoader';

const useStyles = makeStyles(styles);

export type TokenAmountIconProps = {
  amount: BigNumber;
  tokenAddress: TokenEntity['address'];
  chainId: TokenEntity['chainId'];
  className?: string;
  showSymbol?: boolean;
  tokenImageSize?: number;
  amountWithValueClassName?: string;
};
export const TokenAmountIcon = memo<TokenAmountIconProps>(function TokenAmountIcon({
  amount,
  tokenAddress,
  chainId,
  className,
  showSymbol = true,
  tokenImageSize = 24,
  amountWithValueClassName,
}) {
  const classes = useStyles();
  const token = useAppSelector(state => selectTokenByAddress(state, chainId, tokenAddress));
  const tokenPrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, chainId, tokenAddress)
  );
  const valueInUsd = useMemo(() => {
    return amount.multipliedBy(tokenPrice);
  }, [amount, tokenPrice]);

  return (
    <TokenAmountIconComponent
      className={className}
      amountWithValueClassName={amountWithValueClassName}
      amount={
        <TokenAmount
          amount={amount}
          decimals={token.decimals}
          price={tokenPrice}
          className={classes.token}
          minShortPlaces={4}
        />
      }
      value={`~${formatBigUsd(valueInUsd)}`}
      tokenSymbol={showSymbol ? token.symbol : null}
      tokenIcon={
        <TokenImage
          chainId={token.chainId}
          tokenAddress={token.address}
          className={classes.icon}
          size={tokenImageSize}
        />
      }
    />
  );
});

export type TokenAmountIconLoaderProps = {
  className?: string;
};
export const TokenAmountIconLoader = memo<TokenAmountIconLoaderProps>(
  function TokenAmountIconLoader({ className }) {
    return (
      <TokenAmountIconComponent
        className={className}
        amount={<TextLoader placeholder="1234.5678" />}
        value={<TextLoader placeholder="~$1245.56" />}
        tokenSymbol={<TextLoader placeholder="ABC-XYZ LP" />}
        tokenIcon={<IconLoader size={32} />}
      />
    );
  }
);

type TokenAmountIconComponentProps = {
  amount: ReactNode;
  value: ReactNode;
  tokenSymbol?: ReactNode;
  tokenIcon?: ReactNode;
  className?: string;
  amountWithValueClassName?: string;
};
const TokenAmountIconComponent = memo<TokenAmountIconComponentProps>(
  function TokenAmountIconComponent({
    amount,
    value,
    tokenSymbol,
    tokenIcon,
    className,
    amountWithValueClassName,
  }) {
    const classes = useStyles();
    return (
      <div className={clsx(classes.holder, className)}>
        <div className={clsx(classes.amountWithValue, amountWithValueClassName)}>
          {amount}
          <div className={classes.value}>{value}</div>
        </div>
        <div className={classes.tokenWithIcon}>
          {tokenSymbol && <span className={classes.token}>{tokenSymbol}</span>}
          {tokenIcon}
        </div>
      </div>
    );
  }
);
