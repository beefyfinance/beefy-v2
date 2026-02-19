import { css, cx } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { TokenImageFromEntity } from '../../../../../../components/TokenImage/TokenImage.tsx';
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
  type CrossChainTokenOption,
  selectCrossChainSortedChains,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { StepHeader } from '../StepHeader/StepHeader.tsx';
import {
  ListItemBalance,
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
            filteredChains.map(({ chainId, chainName, balanceUsd, tokens }) => (
              <ChainListRow
                key={chainId}
                chainId={chainId}
                chainName={chainName}
                balanceUsd={balanceUsd}
                tokens={tokens}
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
  tokens: CrossChainTokenOption[];
  onSelect: (chainId: ChainEntity['id']) => void;
};

const MAX_VISIBLE_TOKENS = 5;

const ChainListRow = memo(function ChainListRow({
  chainId,
  chainName,
  balanceUsd,
  tokens,
  onSelect,
}: ChainListRowProps) {
  const handleClick = useCallback(() => onSelect(chainId), [onSelect, chainId]);

  const overflowCount = tokens.length > MAX_VISIBLE_TOKENS ? tokens.length - 4 : 0;
  const visibleTokens = overflowCount > 0 ? tokens.slice(0, 4) : tokens;

  return (
    <ChainRowButton type="button" onClick={handleClick}>
      <ListItemSide>
        <ChainIcon chainId={chainId} size={24} />
        <ListItemName>{chainName}</ListItemName>
      </ListItemSide>
      <TokenIcons>
        {visibleTokens.map(({ token }, i) => (
          <TokenIconWrapper key={token.address} style={{ zIndex: i }}>
            <TokenImageFromEntity token={token} size={24} />
          </TokenIconWrapper>
        ))}
        {overflowCount > 0 && <OverflowBadge style={{ zIndex: 5 }}>+{overflowCount}</OverflowBadge>}
      </TokenIcons>
      <ListItemRightSide>
        <ListItemBalance className={balanceTextClass}>
          {formatLargeUsd(balanceUsd ?? BIG_ZERO)}
        </ListItemBalance>
        <ChevronRight className={cx('list-item-arrow', css(listItemArrow))} />
      </ListItemRightSide>
    </ChainRowButton>
  );
});

const ChainRowButton = styled('button', {
  base: {
    textStyle: 'body.medium',
    display: 'grid',
    gridTemplateColumns: '120px 1fr auto',
    alignItems: 'center',
    columnGap: '16px',
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
      '& .list-item-arrow': {
        color: 'text.lightest',
      },
    },
  },
});

const TokenIcons = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifySelf: 'center',
  },
});

const TokenIconWrapper = styled('div', {
  base: {
    position: 'relative',
    marginLeft: '-6px',
    _first: {
      marginLeft: '0',
    },
  },
});

const OverflowBadge = styled('div', {
  base: {
    textStyle: 'subline.xs',
    color: 'text.middle',
    whiteSpace: 'nowrap',
    height: '24px',
    width: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'background.content.darkest',
    position: 'relative',
    marginLeft: '-6px',
  },
});

const balanceTextClass = css({
  color: 'text.middle',
});
