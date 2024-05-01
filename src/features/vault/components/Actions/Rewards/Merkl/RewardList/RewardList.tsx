import { Fragment, memo } from 'react';
import type { ChainEntity } from '../../../../../../data/entities/chain';
import type { BigNumber } from 'bignumber.js';
import type { TokenEntity } from '../../../../../../data/entities/token';
import { AssetsImage } from '../../../../../../../components/AssetsImage';
import { formatTokenDisplayCondensed, formatUsd } from '../../../../../../../helpers/format';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

type RewardListProps = {
  className?: string;
  chainId: ChainEntity['id'];
  rewards: {
    unclaimed: BigNumber;
    accumulated: BigNumber;
    token: TokenEntity | undefined;
    price: BigNumber | undefined;
    decimals: number;
    address: string;
    symbol: string;
  }[];
};

export const RewardList = memo<RewardListProps>(function RewardList({
  chainId,
  rewards,
  className,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.rewards, className)}>
      {rewards.map(r => (
        <Fragment key={r.address}>
          <div className={classes.icon}>
            <AssetsImage
              chainId={chainId}
              assetSymbols={[r.token ? r.token.symbol : r.symbol]}
              size={24}
            />
          </div>
          <div className={classes.amount}>
            {formatTokenDisplayCondensed(r.unclaimed, r.decimals)} {r.symbol}
          </div>
          <div className={classes.value}>
            {r.price ? formatUsd(r.price.multipliedBy(r.unclaimed)) : '-'}
          </div>
        </Fragment>
      ))}
    </div>
  );
});
