import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactVaultId,
  selectTransactWithdrawTokensForChain,
} from '../../../../../data/selectors/transact';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { SearchInput } from '../../../../../../components/SearchInput';
import { Scrollable } from '../../../../../../components/Scrollable';
import { ListItem, ListItemProps } from './components/ListItem';
import { transactActions } from '../../../../../data/reducers/wallet/transact';

const useStyles = makeStyles(styles);

export type WithdrawTokenSelectListProps = {
  className?: string;
};

export const WithdrawTokenSelectList = memo<WithdrawTokenSelectListProps>(function ({ className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  // const availableChains = useAppSelector(selectTransactTokenChains);
  const [selectedChain] = useState(vault.chainId);
  const [search, setSearch] = useState('');
  const optionsForChain = useAppSelector(state =>
    selectTransactWithdrawTokensForChain(state, selectedChain)
  );
  const filteredOptionsForChain = useMemo(() => {
    let options = optionsForChain;

    if (search.length) {
      options = options.filter(option =>
        option.tokens
          .map(token => token.symbol)
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    return options;
  }, [optionsForChain, search]);
  // const hasMultipleChains = availableChains.length > 1;
  const handleTokenSelect = useCallback<ListItemProps['onSelect']>(
    tokenId => {
      dispatch(
        transactActions.selectToken({
          tokensId: tokenId,
          resetInput: false,
        })
      );
    },
    [dispatch]
  );

  return (
    <div className={classes.container}>
      <div className={classes.search}>
        <SearchInput value={search} onChange={setSearch} className={classes.searchInput} />
      </div>
      {/*hasMultipleChains ? <div className={classes.chainSelector}>TODO {selectedChain}</div> : null*/}
      <Scrollable className={classes.listContainer}>
        <div className={classes.list}>
          {filteredOptionsForChain.length ? (
            filteredOptionsForChain.map(option => (
              <ListItem
                key={option.id}
                tokenId={option.id}
                tokens={option.tokens}
                chainId={selectedChain}
                onSelect={handleTokenSelect}
              />
            ))
          ) : (
            <div className={classes.noResults}>{t('Transact-TokenSelect-NoResults')}</div>
          )}
        </div>
      </Scrollable>
    </div>
  );
});
