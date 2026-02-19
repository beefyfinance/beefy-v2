import { css, cx } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  transactSetSelectedChainId,
  transactSwitchStep,
} from '../../../../../data/actions/transact.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  type CrossChainChainOption,
  selectCrossChainSortedChains,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { StepHeader } from '../StepHeader/StepHeader.tsx';
import {
  ListItemBalance,
  ListItemButton,
  ListItemName,
  ListItemRightSide,
  ListItemSide,
  SelectListContainer,
  SelectListItems,
  SelectListNoResults,
  SelectListSearch,
} from '../common/CommonListStyles.tsx';
import { selectListScrollable, listItemArrow } from '../common/CommonListStylesRaw.ts';

export const ChainSelectStep = memo(function ChainSelectStep() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(transactSwitchStep(TransactStep.Form));
  }, [dispatch]);

  return (
    <div>
      <StepHeader onBack={handleBack}>{t('Transact-SelectChain')}</StepHeader>
      <ChainList />
    </div>
  );
});

const ChainList = memo(function ChainList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vaultId = useAppSelector(selectTransactVaultId);
  const sortedChains: CrossChainChainOption[] = useAppSelector(state =>
    selectCrossChainSortedChains(state, vaultId)
  );
  const [search, setSearch] = useState('');

  const handleSelect = useCallback(
    (chainId: ChainEntity['id']) => {
      dispatch(transactSetSelectedChainId(chainId));
    },
    [dispatch]
  );

  const filteredChains = useMemo((): CrossChainChainOption[] => {
    if (search.length === 0) return sortedChains;
    const lowerSearch = search.toLowerCase();
    return sortedChains.filter(
      ({ chainId, chainName }) =>
        chainId.toLowerCase().includes(lowerSearch) || chainName.toLowerCase().includes(lowerSearch)
    );
  }, [sortedChains, search]);

  return (
    <SelectListContainer>
      <SelectListSearch>
        <SearchInput value={search} onValueChange={setSearch} />
      </SelectListSearch>
      <Scrollable css={selectListScrollable}>
        <SelectListItems>
          {filteredChains.length ?
            filteredChains.map(({ chainId, chainName, balanceUsd }) => (
              <ChainListRow
                key={chainId}
                chainId={chainId}
                chainName={chainName}
                balanceUsd={balanceUsd}
                onSelect={handleSelect}
              />
            ))
          : <SelectListNoResults>{t('NoMatches')}</SelectListNoResults>}
        </SelectListItems>
      </Scrollable>
    </SelectListContainer>
  );
});

type ChainListRowProps = {
  chainId: ChainEntity['id'];
  chainName: string;
  balanceUsd: BigNumber;
  onSelect: (chainId: ChainEntity['id']) => void;
};

const ChainListRow = memo(function ChainListRow({
  chainId,
  chainName,
  balanceUsd,
  onSelect,
}: ChainListRowProps) {
  const handleClick = useCallback(() => onSelect(chainId), [onSelect, chainId]);
  const hasBalance = balanceUsd.isGreaterThan(BIG_ZERO);

  return (
    <ListItemButton type="button" onClick={handleClick}>
      <ListItemSide>
        <ChainIcon chainId={chainId} size={24} />
        <ListItemName>{chainName}</ListItemName>
      </ListItemSide>
      <ListItemRightSide>
        {hasBalance && (
          <ListItemBalance className={balanceTextClass}>
            {formatLargeUsd(balanceUsd)}
          </ListItemBalance>
        )}
        <ChevronRight className={cx('list-item-arrow', css(listItemArrow))} />
      </ListItemRightSide>
    </ListItemButton>
  );
});

const balanceTextClass = css({
  color: 'text.middle',
});
