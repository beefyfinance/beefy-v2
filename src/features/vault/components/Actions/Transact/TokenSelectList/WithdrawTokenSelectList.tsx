import { type CssStyles } from '@repo/styles/css';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSelectSelection } from '../../../../../data/actions/transact.ts';
import {
  selectTransactSelectedChainId,
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
  const transactChainId = useAppSelector(selectTransactSelectedChainId);
  const selectedChain = transactChainId ?? vault.chainId;
  const [search, setSearch] = useState('');
  const optionsForChain = useAppSelector(state =>
    selectTransactWithdrawSelectionsForChainWithBalances(state, selectedChain, vaultId)
  );

  const filteredOptions = useMemo(() => {
    let options = optionsForChain;

    if (search.length) {
      const lowerSearch = search.toLowerCase();
      options = options.filter(option =>
        option.tokens
          .map(token => token.symbol)
          .join(' ')
          .toLowerCase()
          .includes(lowerSearch)
      );
    }

    const vaultWithdrawals = [];
    const other = [];
    for (const option of options) {
      const isVaultWithdrawal = option.tokens.length > 1 || option.order === 0;
      const hasBalance = option.balance && option.balance.gt(BIG_ZERO);

      if (isVaultWithdrawal) {
        vaultWithdrawals.push(option);
      } else if (hasBalance) {
        other.push(option);
      }
    }
    vaultWithdrawals.sort((a, b) => b.tokens.length - a.tokens.length);
    return [...vaultWithdrawals, ...other];
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
          {filteredOptions.length ?
            filteredOptions.map(option => (
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
