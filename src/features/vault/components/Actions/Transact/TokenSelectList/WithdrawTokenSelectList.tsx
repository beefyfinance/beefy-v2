import { css, type CssStyles } from '@repo/styles/css';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSelectSelection } from '../../../../../data/actions/transact.ts';
import {
  selectTransactVaultId,
  selectTransactWithdrawSelectionsForChainWithBalances,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import type { ListItemProps } from './components/ListItem/ListItem.tsx';
import { ListItem } from './components/ListItem/ListItem.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type WithdrawTokenSelectListProps = {
  css?: CssStyles;
};

export const WithdrawTokenSelectList = memo(function WithdrawTokenSelectList({
  css: cssProp,
}: WithdrawTokenSelectListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  // const availableChains = useAppSelector(selectTransactTokenChains);
  const [selectedChain] = useState(vault.chainId);
  const [search, setSearch] = useState('');
  const optionsForChain = useAppSelector(state =>
    selectTransactWithdrawSelectionsForChainWithBalances(state, selectedChain, vaultId)
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
    selectionId => {
      dispatch(
        transactSelectSelection({
          selectionId: selectionId,
          resetInput: false,
        })
      );
    },
    [dispatch]
  );

  return (
    <div className={css(styles.container, cssProp)}>
      <div className={classes.search}>
        <SearchInput value={search} onValueChange={setSearch} />
      </div>
      {/*hasMultipleChains ? <div className={classes.chainSelector}>TODO {selectedChain}</div> : null*/}
      <Scrollable css={styles.listContainer}>
        <div className={classes.list}>
          {filteredOptionsForChain.length ?
            filteredOptionsForChain.map(option => (
              <ListItem
                key={option.id}
                selectionId={option.id}
                tokens={option.tokens}
                balance={option.balance}
                decimals={option.decimals}
                tag={option.tag}
                chainId={selectedChain}
                onSelect={handleTokenSelect}
              />
            ))
          : <div className={classes.noResults}>{t('Transact-TokenSelect-NoResults')}</div>}
        </div>
      </Scrollable>
    </div>
  );
});
