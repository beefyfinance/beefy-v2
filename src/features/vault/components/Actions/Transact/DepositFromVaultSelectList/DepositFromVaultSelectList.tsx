import { css, type CssStyles, cx } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { Scrollable } from '../../../../../../components/Scrollable/Scrollable.tsx';
import { VaultIcon } from '../../../../../../components/VaultIdentity/components/VaultIcon/VaultIcon.tsx';
import { VaultPlatformTag } from '../../../../../../components/VaultIdentity/components/VaultTags/VaultTags.tsx';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../../../../../helpers/format.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSelectSelection } from '../../../../../data/actions/transact.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isGovVault,
  isVaultRetired,
  type VaultEntity,
} from '../../../../../data/entities/vault.ts';
import { selectVaultMatchesText } from '../../../../../data/selectors/filtered-vaults.ts';
import { selectTransactDepositFromVaultEntries } from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import type { BeefyState } from '../../../../../data/store/types.ts';
import { simplifySearchText } from '../../../../../../helpers/string.ts';
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

type VaultGroupId = 'retired' | 'vault' | 'pool' | 'clmVault' | 'clmPool';

const GROUP_LABELS: Record<VaultGroupId, string> = {
  retired: 'Retired',
  vault: 'Vault',
  pool: 'Pool',
  clmVault: 'CLM Vault',
  clmPool: 'CLM Pool',
};

const categorizeVault = (vault: VaultEntity): VaultGroupId => {
  if (isVaultRetired(vault)) return 'retired';
  if (isGovVault(vault) && isCowcentratedGovVault(vault)) return 'clmPool';
  if (isCowcentratedLikeVault(vault)) return 'clmVault';
  if (isGovVault(vault)) return 'pool';
  return 'vault';
};

const platformTagOverride = css.raw({
  alignSelf: 'flex-start',
  backgroundColor: 'white.100-4a',
});

const rightSideOverride = css.raw({
  flexShrink: 0,
});

export type DepositFromVaultSelectListProps = {
  css?: CssStyles;
};

export const DepositFromVaultSelectList = memo(function DepositFromVaultSelectList({
  css: cssProp,
}: DepositFromVaultSelectListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entries = useAppSelector(selectTransactDepositFromVaultEntries);
  const vaultById = useAppSelector((state: BeefyState) => state.entities.vaults.byId);
  const [search, setSearch] = useState('');

  const searchFiltered = useAppSelector((state: BeefyState) => {
    const searchText = simplifySearchText(search);
    if (searchText.length === 0) return entries;
    return entries.filter(entry => {
      const vault = vaultById[entry.vaultId];
      if (!vault) return false;
      return selectVaultMatchesText(state, vault, searchText);
    });
  });

  const groups = useMemo(() => {
    const buckets = new Map<
      VaultGroupId,
      { entries: typeof searchFiltered; totalUsd: BigNumber }
    >();
    for (const entry of searchFiltered) {
      const vault = vaultById[entry.vaultId];
      if (!vault) continue;
      const groupId = categorizeVault(vault);
      const bucket = buckets.get(groupId);
      if (bucket) {
        bucket.entries.push(entry);
        bucket.totalUsd = bucket.totalUsd.plus(entry.balanceUsd);
      } else {
        buckets.set(groupId, { entries: [entry], totalUsd: entry.balanceUsd });
      }
    }

    const ordered: Array<{ id: VaultGroupId; label: string; entries: typeof searchFiltered }> = [];
    const retired = buckets.get('retired');
    if (retired) {
      ordered.push({ id: 'retired', label: GROUP_LABELS.retired, entries: retired.entries });
      buckets.delete('retired');
    }
    const rest = Array.from(buckets.entries()).sort(
      ([, a], [, b]) => b.totalUsd.comparedTo(a.totalUsd) ?? 0
    );
    for (const [id, bucket] of rest) {
      ordered.push({ id, label: GROUP_LABELS[id], entries: bucket.entries });
    }
    return ordered;
  }, [searchFiltered, vaultById]);

  const totalVisible = useMemo(
    () => groups.reduce((sum, group) => sum + group.entries.length, 0),
    [groups]
  );

  const handleSelect = useCallback(
    (selectionId: string) => {
      dispatch(transactSelectSelection({ selectionId, resetInput: true }));
    },
    [dispatch]
  );

  return (
    <SelectListContainer css={cssProp} tall={true}>
      <SelectListSearch>
        <SearchInput value={search} onValueChange={setSearch} />
      </SelectListSearch>
      <Scrollable css={selectListScrollable}>
        <SelectListItems noGap={true}>
          {totalVisible === 0 ?
            <SelectListNoResults>{t('Transact-DepositFromVault-NoResults')}</SelectListNoResults>
          : groups.map(group => (
              <Group key={group.id}>
                <GroupHeader variant={group.id}>{group.label}</GroupHeader>
                {group.entries.map(entry => (
                  <VaultListItem
                    key={entry.vaultId}
                    vaultId={entry.vaultId}
                    selectionId={entry.id}
                    balance={entry.balance}
                    balanceUsd={entry.balanceUsd}
                    decimals={entry.decimals}
                    onSelect={handleSelect}
                  />
                ))}
              </Group>
            ))
          }
        </SelectListItems>
      </Scrollable>
    </SelectListContainer>
  );
});

type VaultListItemProps = {
  vaultId: VaultEntity['id'];
  selectionId: string;
  balance: BigNumber;
  balanceUsd: BigNumber;
  decimals: number;
  onSelect: (selectionId: string) => void;
};

const VaultListItem = memo(function VaultListItem({
  vaultId,
  selectionId,
  balance,
  balanceUsd,
  decimals,
  onSelect,
}: VaultListItemProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);

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
          <VaultRowName className="vault-row-name">{vault.names.list}</VaultRowName>
          <VaultPlatformTag vaultId={vaultId} css={platformTagOverride} />
        </VaultNameAndTags>
      </VaultLeft>
      <ListItemRightSide css={rightSideOverride}>
        <BalanceColumn>
          <ListItemBalanceAmount className="vault-row-balance">
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

const Group = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
});

const GroupHeader = styled('div', {
  base: {
    alignSelf: 'flex-start',
    textStyle: 'subline.sm',
    fontWeight: 'semiBold',
    textTransform: 'uppercase',
    color: 'text.lightest',
    paddingBlock: '2px',
    paddingInline: '8px',
    borderRadius: '4px',
    marginBlock: '12px 4px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
  },
  variants: {
    variant: {
      retired: {
        backgroundColor: 'tagRetiredBackground',
      },
      vault: {
        backgroundColor: 'tags.vault.background',
      },
      pool: {
        backgroundColor: 'tags.pool.background',
      },
      clmVault: {
        backgroundColor: 'tagClmBackground',
      },
      clmPool: {
        backgroundColor: 'tagClmBackground',
      },
    },
  },
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
      '& .vault-row-name': {
        color: 'text.light',
      },
      '& .vault-row-balance': {
        color: 'text.light',
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
    flex: '1 1 auto',
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
    textStyle: 'body.medium',
    color: 'text.dark',
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
