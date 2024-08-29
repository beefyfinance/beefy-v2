import { memo } from 'react';
import { formatTokenDisplay, formatTokenDisplayCondensed } from '../../helpers/format';
import { Tooltip } from '../Tooltip';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import type { BigNumber } from 'bignumber.js';
import type { TokenEntity } from '../../features/data/entities/token';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type TokenAmountProps = {
  amount: BigNumber;
  decimals: number;
  className?: string;
  onClick?: () => void;
  disableTooltip?: boolean;
};
export const TokenAmount = memo<TokenAmountProps>(function TokenAmount({
  amount,
  decimals,
  className,
  onClick,
  disableTooltip,
}) {
  const classes = useStyles();
  const fullAmount = formatTokenDisplay(amount, decimals);
  const shortAmount = formatTokenDisplayCondensed(amount, decimals);
  const needTooltip = shortAmount.length < fullAmount.length;

  return needTooltip ? (
    disableTooltip ? (
      <span onClick={onClick} className={clsx(className, { [classes.withOnClick]: onClick })}>
        {shortAmount}
      </span>
    ) : (
      <Tooltip
        onTriggerClick={onClick}
        triggerClass={clsx(classes.withTooltip, className, { [classes.withOnClick]: onClick })}
        content={<BasicTooltipContent title={fullAmount} />}
        compact={true}
      >
        {shortAmount}
      </Tooltip>
    )
  ) : (
    <span onClick={onClick} className={clsx(className, { [classes.withOnClick]: onClick })}>
      {fullAmount}
    </span>
  );
});

export type TokenAmountFromEntityProps = Omit<TokenAmountProps, 'decimals'> & {
  token: TokenEntity;
};

export const TokenAmountFromEntity = memo<TokenAmountFromEntityProps>(
  function TokenAmountFromEntity({ token, ...rest }) {
    return <TokenAmount decimals={token.decimals} {...rest} />;
  }
);
