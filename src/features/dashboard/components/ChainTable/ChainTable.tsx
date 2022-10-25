import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React, { memo } from 'react';
import { SortColumnHeader } from '../../../../components/SortColumnHeader';
import { formatUsd } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import { ChainEntity } from '../../../data/entities/chain';
import { selectChainById } from '../../../data/selectors/chains';
import {
  selectFilterSearchSortDirection,
  selectFilterSearchSortField,
} from '../../../data/selectors/filtered-vaults';
import { TableVaults } from './components/TableVaults/TableVaults';
import { styles } from './styles';

interface ChainTableProps {
  chainId: ChainEntity['id'];
  data: any;
}

const useStyles = makeStyles(styles);

export const ChainTable = memo<ChainTableProps>(function ({ chainId, data }) {
  const classes = useStyles();
  return (
    <div className={classes.tableContainer}>
      <TableTitle chainId={chainId} deposited={data.depositedByChain} />
      <div className={classes.scroller}>
        <TableFilter chainId={chainId} />
        <TableVaults data={data} />
      </div>
    </div>
  );
});

interface TableTitleProps {
  chainId: ChainEntity['id'];
  deposited: BigNumber;
}

const TableTitle = memo<TableTitleProps>(function ({ chainId, deposited }) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <div className={classes.titleContainer}>
      <img
        className={classes.icon}
        src={require(`../../../../images/networks/${chainId}.svg`).default}
        alt={chain.name}
      />
      <div className={classes.title}>{chain.name}</div>
      <div className={classes.value}>{formatUsd(deposited)}</div>
    </div>
  );
});

interface TableFilterProps {
  chainId: ChainEntity['id'];
}

const SORT_COLUMNS: {
  label: string;
  sortKey: 'platform' | 'deposited' | 'apy' | 'daily';
}[] = [
  { label: 'Filter-SortPlatform', sortKey: 'platform' },
  { label: 'Filter-SortDeposited', sortKey: 'deposited' },
  { label: 'Filter-SortApy', sortKey: 'apy' },
  { label: 'Filter-SortDaily', sortKey: 'daily' },
];

const TableFilter = memo<TableFilterProps>(function () {
  const classes = useStyles();

  const sortField = useAppSelector(selectFilterSearchSortField);
  const sortDirection = useAppSelector(selectFilterSearchSortDirection);

  const handleSort = () => {
    console.log('hola');
  };

  return (
    <div className={classes.sortColumns}>
      <SortColumnHeader
        onChange={handleSort}
        key="vault"
        label="Vaults"
        sortKey="default"
        sorted="none"
      />
      {SORT_COLUMNS.map(({ label, sortKey }) => (
        <SortColumnHeader
          key={label}
          label={label}
          sortKey={sortKey}
          sorted={sortField === sortKey ? sortDirection : 'none'}
          onChange={handleSort}
        />
      ))}
    </div>
  );
});
