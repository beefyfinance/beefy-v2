import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactSelectedChainId,
  selectTransactTokenChainIds,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { Scrollable } from '../../../../../../components/Scrollable';
import type { ListItemProps } from './components/ListItem';
import { ListItem } from './components/ListItem';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import clsx from 'clsx';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { orderBy } from 'lodash-es';

const useStyles = makeStyles(styles);

export type ChainSelectListProps = {
  className?: string;
};

export const ChainSelectList = memo<ChainSelectListProps>(function ChainSelectList({ className }) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const availableChainIds = useAppSelector(selectTransactTokenChainIds);
  const selectedChainId = useAppSelector(selectTransactSelectedChainId);
  const sortedOptions = useMemo(() => {
    return orderBy(
      availableChainIds,
      [id => (id === vault.chainId ? 1 : 0), id => id],
      ['desc', 'asc']
    );
  }, [availableChainIds, vault]);

  const handleChainSelect = useCallback<ListItemProps['onSelect']>(
    chainId => {
      dispatch(transactActions.selectChain({ chainId }));
    },
    [dispatch]
  );

  return (
    <div className={clsx(classes.container, className)}>
      <Scrollable className={classes.listContainer}>
        <div className={classes.list}>
          {sortedOptions.map(chainId => (
            <ListItem
              key={chainId}
              chainId={chainId}
              onSelect={handleChainSelect}
              selected={chainId === selectedChainId}
              native={chainId === vault.chainId}
            />
          ))}
        </div>
      </Scrollable>
    </div>
  );
});
