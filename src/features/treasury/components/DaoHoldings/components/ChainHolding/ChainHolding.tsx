import { memo } from 'react';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import { makeStyles } from '@material-ui/core';
import { formatBigUsd } from '../../../../../../helpers/format';
import BigNumber from 'bignumber.js';
import { ChainEntity } from '../../../../../data/entities/chain';
import { selectTreasurySummaryByChainId } from '../../../../../data/selectors/treasury';

import { Assets } from '../Assets';

const useStyles = makeStyles(styles);

interface ChainHoldingProps {
  chainId: ChainEntity['id'];
}

export const ChainHolding = memo<ChainHoldingProps>(function ({ chainId }) {
  const { totalUsd, assets } = useAppSelector(state =>
    selectTreasurySummaryByChainId(state, chainId)
  );

  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <img
          src={require(`../../../../../../images/networks/${chainId}.svg`).default}
          alt={chainId}
        />
        <div>{chain.name}</div>
        <span>{formatBigUsd(new BigNumber(totalUsd))}</span>
      </div>
      <Assets assets={assets} chainId={chainId} />
    </div>
  );
});
