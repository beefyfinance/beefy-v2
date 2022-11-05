import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SortColumnHeader } from '../../../../components/SortColumnHeader';
import { formatUsd } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import { ChainEntity } from '../../../data/entities/chain';
import { VaultEntity } from '../../../data/entities/vault';
import { selectChainById } from '../../../data/selectors/chains';
import { TableVaults } from './components/TableVaults/TableVaults';
import { SortedOptions, useSortVaults } from './hooks';
import { styles } from './styles';
import { Scrollable } from '../../../../components/Scrollable';

interface ChainTableProps {
  chainId: ChainEntity['id'];
  data: { vaults: VaultEntity[]; depositedByChain: BigNumber };
}

const useStyles = makeStyles(styles);

export const ChainTable = memo<ChainTableProps>(function ({ chainId, data }) {
  const classes = useStyles();

  const { sortedVaults, sortedOptions, handleSort } = useSortVaults(data.vaults, chainId);

  return (
    <div className={classes.tableContainer}>
      <TableTitle chainId={chainId} deposited={data.depositedByChain} />
      <Scrollable autoHeight={true}>
        <TableFilter sortOptions={sortedOptions} handleSort={handleSort} />
        <TableVaults vaults={sortedVaults} />
      </Scrollable>
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

const SORT_COLUMNS: {
  label: string;
  sortKey: 'platform' | 'depositValue' | 'apy' | 'daily';
  bigClassName: boolean;
}[] = [
  { label: 'Filter-SortPlatform', sortKey: 'platform', bigClassName: false },
  { label: 'Filter-SortDeposited', sortKey: 'depositValue', bigClassName: true },
  { label: 'Filter-SortApy', sortKey: 'apy', bigClassName: false },
  { label: 'Filter-SortDaily', sortKey: 'daily', bigClassName: true },
];

interface TableFilterProps {
  sortOptions: SortedOptions;
  handleSort: (field: string) => void;
}

const TableFilter = memo<TableFilterProps>(function ({ sortOptions, handleSort }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const { sort, sortDirection } = sortOptions;

  return (
    <div className={classes.sortColumns}>
      <div className={classes.columnHeader}>{t('Vaults')}</div>
      {SORT_COLUMNS.map(({ label, sortKey, bigClassName }) => (
        <SortColumnHeader
          key={label}
          label={label}
          sortKey={sortKey}
          sorted={sort === sortKey ? sortDirection : 'none'}
          onChange={handleSort}
          className={bigClassName ? classes.itemBig : classes.itemSmall}
        />
      ))}
    </div>
  );
});
