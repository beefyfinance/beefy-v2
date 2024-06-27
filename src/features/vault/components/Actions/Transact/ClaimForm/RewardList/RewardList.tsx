import { Fragment, memo, useMemo } from 'react';
import type { BigNumber } from 'bignumber.js';
import type { TokenEntity } from '../../../../../../data/entities/token';
import {
  formatPercent,
  formatTokenDisplayCondensed,
  formatUsd,
} from '../../../../../../../helpers/format';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { TokenImageFromEntity } from '../../../../../../../components/TokenImage/TokenImage';
import { orderBy } from 'lodash-es';

const useStyles = makeStyles(styles);

type Token = Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'chainId'>;

type RewardListProps = {
  className?: string;
  deposited: boolean;
  rewards: {
    active: boolean;
    balance: BigNumber;
    token: Token;
    price: BigNumber | undefined;
    apr: number | undefined;
  }[];
};

export const RewardList = memo<RewardListProps>(function RewardList({
  rewards,
  deposited,
  className,
}) {
  const classes = useStyles();
  const sortedRewards = useMemo(
    () => (deposited ? rewards : orderBy(rewards, r => r.apr, 'desc')),
    [rewards, deposited]
  );

  return (
    <div className={clsx(classes.rewards, className)}>
      {sortedRewards.map(r => (
        <Fragment key={r.token.address}>
          <div className={classes.icon}>
            <TokenImageFromEntity token={r.token} size={24} />
          </div>
          <div className={classes.amount}>
            {r.active && r.balance.isZero()
              ? deposited
                ? 'Earning'
                : 'Earn'
              : formatTokenDisplayCondensed(r.balance, r.token.decimals)}
            {` ${r.token.symbol}`}
          </div>
          <div className={classes.value}>
            {r.active && r.balance.isZero() && r.apr
              ? formatPercent(r.apr)
              : !r.balance.isZero() && r.price
              ? formatUsd(r.price.multipliedBy(r.balance))
              : '-'}
          </div>
        </Fragment>
      ))}
    </div>
  );
});
