import { memo } from 'react';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import { makeStyles } from '@material-ui/core';
import { formatBigUsd } from '../../../../../../helpers/format';
import { ChainEntity } from '../../../../../data/entities/chain';
import { selectTreasuryBalanceByChainId } from '../../../../../data/selectors/treasury';

import { Assets } from '../Assets';
import clsx from 'clsx';
import { ExplorerLinks } from '../../../ExplorerLinks';

const useStyles = makeStyles(styles);

interface ChainHoldingProps {
  chainId: ChainEntity['id'];
}

export const ChainHolding = memo<ChainHoldingProps>(function ({ chainId }) {
  const totalUsd = useAppSelector(state => selectTreasuryBalanceByChainId(state, chainId));

  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <div className={classes.container}>
      <div className={clsx(classes.title, classes[`headerNetwork-${chainId}`])}>
        <div className={classes.nameContainer}>
          <img
            className={classes.icon}
            src={require(`../../../../../../images/networks/${chainId}.svg`).default}
            alt={chainId}
          />
          <div className={classes.chainName}>{chain.name}</div>
          <ExplorerLinks chainId={chainId} />
        </div>
        <div className={classes.usdValue}>{formatBigUsd(totalUsd)}</div>
      </div>
      <Assets chainId={chainId} />
    </div>
  );
});
