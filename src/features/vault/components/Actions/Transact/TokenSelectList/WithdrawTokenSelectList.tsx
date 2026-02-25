import { type CssStyles } from '@repo/styles/css';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSelectSelection } from '../../../../../data/actions/transact.ts';
import {
  selectTransactVaultId,
  selectTransactWithdrawSelectionsForChainWithBalances,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import type { ListItemProps } from './components/ListItem/ListItem.tsx';
import { ListItem } from './components/ListItem/ListItem.tsx';
import {
  SelectListContainer,
  SelectListItems,
  SelectListNoResults,
  SelectListSearch,
} from '../common/CommonListStyles.tsx';
import { selectListScrollable } from '../common/CommonListStylesRaw.ts';

export type WithdrawTokenSelectListProps = {
  css?: CssStyles;
};

export const WithdrawTokenSelectList = memo(function WithdrawTokenSelectList({
  css: cssProp,
}: WithdrawTokenSelectListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
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
    <SelectListContainer css={cssProp}>
      <SelectListSearch>
        <SearchInput value={search} onValueChange={setSearch} />
      </SelectListSearch>
      <Scrollable css={selectListScrollable}>
        <SelectListItems noGap={true}>
          {filteredOptionsForChain.length ?
            filteredOptionsForChain.map(option => (
              <ListItem
                key={option.id}
                selectionId={option.id}
                tokens={option.tokens}
                balance={option.balance}
                balanceValue={option.balanceValue}
                decimals={option.decimals}
                tag={option.tag}
                chainId={selectedChain}
                onSelect={handleTokenSelect}
              />
            ))
          : <SelectListNoResults>{t('Transact-TokenSelect-NoResults')}</SelectListNoResults>}
        </SelectListItems>
      </Scrollable>
    </SelectListContainer>
  );
});
