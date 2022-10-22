import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { formatUsd } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import { ChainEntity } from '../../../data/entities/chain';
import { selectChainById } from '../../../data/selectors/chains';
import { styles } from './styles';

interface ChainTableProps {
  chainId: ChainEntity['id'];
  data: any;
}

const useStyles = makeStyles(styles);

export const ChainTable = memo<ChainTableProps>(function ({ chainId, data }) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const classes = useStyles();

  return (
    <div className={classes.tableContainer}>
      <div className={classes.titleContainer}>
        <img
          className={classes.icon}
          src={require(`../../../../images/networks/${chainId}.svg`).default}
          alt={chain.name}
        />
        <div className={classes.title}>{chain.name}</div>
        <div className={classes.value}>{formatUsd(data.depositedByChain)}</div>
      </div>
    </div>
  );
});
