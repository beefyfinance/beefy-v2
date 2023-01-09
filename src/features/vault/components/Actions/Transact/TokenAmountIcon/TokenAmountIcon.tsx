import { memo, ReactNode, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { TokenEntity } from '../../../../../data/entities/token';
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
};
export const TokenAmountIcon = memo<TokenAmountIconProps>(function ({
  amount,
  tokenAddress,
  chainId,
  className,
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
      amount={
        <TokenAmount
          amount={amount}
          decimals={token.decimals}
          price={tokenPrice}
          className={classes.token}
          minShortPlaces={4}
        />
      }
      value={formatBigUsd(valueInUsd)}
      tokenSymbol={token.symbol}
      tokenIcon={
        <TokenImage chainId={token.chainId} tokenAddress={token.address} className={classes.icon} />
      }
    />
  );
});

export type TokenAmountIconLoaderProps = {
  className?: string;
};
export const TokenAmountIconLoader = memo<TokenAmountIconLoaderProps>(function ({ className }) {
  return (
    <TokenAmountIconComponent
      className={className}
      amount={<TextLoader placeholder="1234.5678" />}
      value={<TextLoader placeholder="$1245.56" />}
      tokenSymbol={<TextLoader placeholder="ABC-XYZ LP" />}
      tokenIcon={<IconLoader size={32} />}
    />
  );
});

type TokenAmountIconComponentProps = {
  amount: ReactNode;
  value: ReactNode;
  tokenSymbol: ReactNode;
  tokenIcon?: ReactNode;
  className?: string;
};
const TokenAmountIconComponent = memo<TokenAmountIconComponentProps>(function ({
  amount,
  value,
  tokenSymbol,
  tokenIcon,
  className,
}) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.holder, className)}>
      <div className={classes.amountWithValue}>
        {amount}
        <div className={classes.value}>{value}</div>
      </div>
      <div className={classes.tokenWithIcon}>
        <span className={classes.token}>{tokenSymbol}</span>
        {tokenIcon}
      </div>
    </div>
  );
});
