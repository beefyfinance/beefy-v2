import { css, type CssStyles, cx } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { VaultIcon } from '../../../../../../components/VaultIdentity/components/VaultIcon/VaultIcon.tsx';
import { VaultTags } from '../../../../../../components/VaultIdentity/components/VaultTags/VaultTags.tsx';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../../../../../helpers/format.ts';
import { transactSelectDepositFromVault } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectTransactDepositFromVaultEntries } from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  ListItemBalanceAmount,
  ListItemBalanceUsd,
  ListItemRightSide,
  SelectListContainer,
  SelectListItems,
  SelectListNoResults,
  SelectListSearch,
} from '../common/CommonListStyles.tsx';
import { listItemArrow, selectListScrollable } from '../common/CommonListStylesRaw.ts';

export type DepositFromVaultSelectListProps = {
  css?: CssStyles;
};

export const DepositFromVaultSelectList = memo(function DepositFromVaultSelectList({
  css: cssProp,
}: DepositFromVaultSelectListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entries = useAppSelector(selectTransactDepositFromVaultEntries);
  const [search, setSearch] = useState('');

  const entriesFiltered = useMemo(() => {
    if (search.length === 0) return entries;
    const lowerSearch = search.toLowerCase();
    return entries.filter(e => e.searchString.includes(lowerSearch));
  }, [entries, search]);

  const handleSelect = useCallback(
    (vaultId: VaultEntity['id']) => {
      dispatch(transactSelectDepositFromVault(vaultId));
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
          {entriesFiltered.length === 0 ?
            <SelectListNoResults>{t('Transact-DepositFromVault-NoResults')}</SelectListNoResults>
          : entriesFiltered.map(entry => (
              <VaultListItem
                key={entry.vaultId}
                vaultId={entry.vaultId}
                balance={entry.balance}
                balanceUsd={entry.balanceUsd}
                decimals={entry.decimals}
                onSelect={handleSelect}
              />
            ))
          }
        </SelectListItems>
      </Scrollable>
    </SelectListContainer>
  );
});

type VaultListItemProps = {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
  balanceUsd: BigNumber;
  decimals: number;
  onSelect: (vaultId: VaultEntity['id']) => void;
};

const VaultListItem = memo(function VaultListItem({
  vaultId,
  balance,
  balanceUsd,
  decimals,
  onSelect,
}: VaultListItemProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const handleClick = useCallback(() => onSelect(vaultId), [onSelect, vaultId]);

  const balanceUsdFormatted = useMemo(() => {
    if (!balanceUsd || balanceUsd.isZero()) return null;
    if (balanceUsd.lt(0.01)) return '<$0.01';
    return formatLargeUsd(balanceUsd);
  }, [balanceUsd]);

  return (
    <VaultRowButton type="button" onClick={handleClick}>
      <VaultLeft>
        <IconWrapper>
          <VaultIcon vaultId={vaultId} size={32} />
          <ChainBadge>
            <ChainIcon chainId={vault.chainId} size={12} />
          </ChainBadge>
        </IconWrapper>
        <VaultNameAndTags>
          <VaultRowName>{vault.names.list}</VaultRowName>
          <TagsWrapper>
            <VaultTags vaultId={vaultId} />
          </TagsWrapper>
        </VaultNameAndTags>
      </VaultLeft>
      <ListItemRightSide>
        <BalanceColumn>
          <ListItemBalanceAmount>
            {formatTokenDisplayCondensed(balance, decimals, 8)}
          </ListItemBalanceAmount>
          {balanceUsdFormatted != null ?
            <ListItemBalanceUsd>{balanceUsdFormatted}</ListItemBalanceUsd>
          : null}
        </BalanceColumn>
        <ChevronRight className={cx('list-item-arrow', css(listItemArrow))} />
      </ListItemRightSide>
    </VaultRowButton>
  );
});

const VaultRowButton = styled('button', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    height: '57px',
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
        color: 'text.middle',
      },
    },
  },
});

const VaultLeft = styled('div', {
  base: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: '20px',
    minWidth: 0,
  },
});

const VaultNameAndTags = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    minWidth: 0,
  },
});

const VaultRowName = styled('span', {
  base: {
    color: 'text.dark',
    fontWeight: 'normal',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const IconWrapper = styled('div', {
  base: {
    position: 'relative',
    display: 'inline-block',
    flexShrink: 0,
    width: '32px',
    height: '32px',
  },
});

const ChainBadge = styled('div', {
  base: {
    position: 'absolute',
    right: '-2px',
    bottom: '-2px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    overflow: 'hidden',
    lineHeight: 0,
  },
});

const TagsWrapper = styled('div', {
  base: {
    '& > div': {
      marginTop: '0',
      columnGap: '4px',
      rowGap: '4px',
    },
    '& > div > div': {
      height: '20px',
      padding: '0 6px',
    },
    '& > div > div:first-child': {
      backgroundColor: 'white.100-4a',
    },
  },
});

const BalanceColumn = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0',
    flexShrink: 1,
    minWidth: 0,
    fontWeight: 'normal',
  },
});
