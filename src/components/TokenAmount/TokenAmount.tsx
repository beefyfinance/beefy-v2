import { memo } from 'react';
import { formatFullBigNumber, formatSignificantBigNumber } from '../../helpers/format';
import { Tooltip } from '../Tooltip';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import { BigNumber } from 'bignumber.js';
import { TokenEntity } from '../../features/data/entities/token';
import { useAppSelector } from '../../store';
import { selectTokenPriceByAddress } from '../../features/data/selectors/tokens';

export type TokenAmountProps = {
  amount: BigNumber;
  decimals: number;
  price: BigNumber;
  className?: string;
};
export const TokenAmount = memo<TokenAmountProps>(function TokenAmount({
  amount,
  decimals,
  price,
  className,
}) {
  const fullAmount = formatFullBigNumber(amount, decimals);
  const shortAmount = formatSignificantBigNumber(amount, decimals, price);
  const needTooltip = shortAmount.length < fullAmount.length;

  return needTooltip ? (
    <Tooltip triggerClass={className} content={<BasicTooltipContent title={fullAmount} />}>
      {shortAmount}
    </Tooltip>
  ) : (
    <span className={className}>{fullAmount}</span>
  );
});

export type TokenAmountFromEntityProps = {
  amount: BigNumber;
  token: TokenEntity;
  className?: string;
};
export const TokenAmountFromEntity = memo<TokenAmountFromEntityProps>(function ({
  amount,
  token,
  className,
}) {
  const price = useAppSelector(state =>
    selectTokenPriceByAddress(state, token.chainId, token.address)
  );
  return (
    <TokenAmount amount={amount} decimals={token.decimals} price={price} className={className} />
  );
});
