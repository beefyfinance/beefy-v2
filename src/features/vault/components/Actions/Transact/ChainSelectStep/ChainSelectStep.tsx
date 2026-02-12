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
    <div className={containerClass}>
      <div className={searchClass}>
        <SearchInput value={search} onValueChange={setSearch} />
      </div>
      <Scrollable css={scrollableClass}>
        <div className={listClass}>
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
          : <div className={noResultsClass}>{t('NoMatches')}</div>}
        </div>
      </Scrollable>
    </div>
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
    <button type="button" className={itemClass} onClick={handleClick}>
      <div className={sideClass}>
        <ChainIcon chainId={chainId} size={24} />
        <span className={nameClass}>{chainName}</span>
      </div>
      <div className={rightSideClass}>
        {hasBalance && <span className={balanceTextClass}>{formatLargeUsd(balanceUsd)}</span>}
        <ChevronRight className={cx('chain-arrow', arrowClass)} />
      </div>
    </button>
  );
});

// Styles
const containerClass = css({
  padding: '24px 0 0 0',
  height: '469px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '0 0 12px 12px',
  overflow: 'hidden',
});

const searchClass = css({
  padding: '0 24px',
  margin: '0 0 24px 0',
});

const scrollableClass = css.raw({
  flexGrow: 1,
  height: '100%',
});

const listClass = css({
  padding: '0 24px 24px 24px',
  minHeight: '100px',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '16px',
  overflowY: 'auto',
});

const noResultsClass = css({
  padding: '8px 12px',
  borderRadius: '8px',
  background: 'background.content.light',
});

const itemClass = css({
  textStyle: 'body.medium',
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  width: '100%',
  color: 'text.dark',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: '0',
  margin: '0',
  cursor: 'pointer',
  userSelect: 'none',
  outline: 'none',
  textAlign: 'left',
  '&:hover, &:focus-visible': {
    color: 'text.middle',
    '& .chain-arrow': {
      color: 'text.lightest',
    },
  },
});

const sideClass = css({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: '8px',
});

const rightSideClass = css({
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 1,
  minWidth: 0,
});

const nameClass = css({
  whiteSpace: 'nowrap',
});

const balanceTextClass = css({
  flexShrink: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: 'text.middle',
});

const arrowClass = css({
  color: 'text.middle',
  height: '24px',
  width: '8px',
  flexShrink: 0,
});
