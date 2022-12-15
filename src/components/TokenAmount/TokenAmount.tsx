import { memo } from 'react';
import { formatFullBigNumber, formatSignificantBigNumber } from '../../helpers/format';
import { Tooltip } from '../Tooltip';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import { BigNumber } from 'bignumber.js';
import { TokenEntity } from '../../features/data/entities/token';
import { useAppSelector } from '../../store';
import { selectTokenPriceByAddress } from '../../features/data/selectors/tokens';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type TokenAmountProps = {
  amount: BigNumber;
  decimals: number;
  price: BigNumber;
  minShortPlaces?: number;
  className?: string;
};
export const TokenAmount = memo<TokenAmountProps>(function TokenAmount({
  amount,
  decimals,
  price,
  minShortPlaces = 2,
  className,
}) {
  const classes = useStyles();
  const fullAmount = formatFullBigNumber(amount, decimals);
  const shortAmount = formatSignificantBigNumber(amount, decimals, price, 0, minShortPlaces);
  const needTooltip = shortAmount.length < fullAmount.length;

  return needTooltip ? (
    <Tooltip
      triggerClass={clsx(classes.withTooltip, className)}
      content={<BasicTooltipContent title={fullAmount} />}
    >
      {shortAmount}
    </Tooltip>
  ) : (
    <span className={className}>{fullAmount}</span>
  );
});

export type TokenAmountFromEntityProps = {
  amount: BigNumber;
  token: TokenEntity;
  minShortPlaces?: number;
  className?: string;
};
export const TokenAmountFromEntity = memo<TokenAmountFromEntityProps>(function ({
  amount,
  token,
  minShortPlaces = 2,
  className,
}) {
  const price = useAppSelector(state =>
    selectTokenPriceByAddress(state, token.chainId, token.address)
  );
  return (
    <TokenAmount
      amount={amount}
      decimals={token.decimals}
      price={price}
      className={className}
      minShortPlaces={minShortPlaces}
    />
  );
});
