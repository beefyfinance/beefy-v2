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
import AutocompoundIcon from '../../../../../../images/icons/autocompound.svg?react';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import ClaimableIcon from '../../../../../../images/icons/claimable.svg?react';
import WalletIcon from '../../../../../../images/icons/wallet2.svg?react';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../../../../../helpers/format.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSelectSelection } from '../../../../../data/actions/transact.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectVaultMatchesText } from '../../../../../data/selectors/filtered-vaults.ts';
import {
  depositFromVaultEntriesEqual,
  selectTransactDepositFromVaultEntries,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
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
import { CLM_SIDE_NAME, type ClmSide, groupDepositFromVaultEntries } from './groups.ts';

const platformTagOverride = css.raw({
  alignSelf: 'flex-start',
  backgroundColor: 'white.100-4a',
});

const rightSideOverride = css.raw({
  flexShrink: 0,
});

export type DepositFromVaultSelectListProps = {
  css?: CssStyles;
  /** a CLM held on several sides opens its positions instead of selecting */
  onOpenClm: (clmId: VaultEntity['id']) => void;
};

export const DepositFromVaultSelectList = memo(function DepositFromVaultSelectList({
  css: cssProp,
  onOpenClm,
}: DepositFromVaultSelectListProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const entries = useAppSelector(
    selectTransactDepositFromVaultEntries,
    depositFromVaultEntriesEqual
  );
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
  }, depositFromVaultEntriesEqual);

  const destVaultId = useAppSelector(selectTransactVaultId);
  const groups = useMemo(() => {
    const dest = vaultById[destVaultId];
    const destClmId = dest && isCowcentratedLikeVault(dest) ? dest.cowcentratedIds.clm : undefined;
    return groupDepositFromVaultEntries(searchFiltered, vaultById, destClmId);
  }, [searchFiltered, vaultById, destVaultId]);

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
          {groups.length === 0 ?
            <SelectListNoResults>{t('Transact-DepositFromVault-NoResults')}</SelectListNoResults>
          : groups.map(group => (
              <Group key={group.id}>
                <GroupHeader variant={group.id}>
                  {t(`Transact-DepositFromVault-Group-${group.id}`)}
                </GroupHeader>
                {group.rows.map(row =>
                  row.kind === 'single' ?
                    <VaultListItem
                      key={row.entry.vaultId}
                      vaultId={row.entry.vaultId}
                      selectionId={row.entry.id}
                      balance={row.entry.balance}
                      balanceUsd={row.entry.balanceUsd}
                      decimals={row.entry.decimals}
                      side={row.side}
                      onSelect={handleSelect}
                    />
                  : <ClmListItem
                      key={row.clmId}
                      vaultId={row.entries[0].vaultId}
                      clmId={row.clmId}
                      count={row.entries.length}
                      totalUsd={row.totalUsd}
                      onOpen={onOpenClm}
                    />
                )}
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
  side: ClmSide | undefined;
  onSelect: (selectionId: string) => void;
};

const VaultListItem = memo(function VaultListItem({
  vaultId,
  selectionId,
  balance,
  balanceUsd,
  decimals,
  side,
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
          <TagLine>
            <VaultPlatformTag vaultId={vaultId} css={platformTagOverride} />
            {side ?
              <ClmSideLabel side={side} />
            : null}
          </TagLine>
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

type ClmListItemProps = {
  /** any member of the CLM, for its icon, name and platform */
  vaultId: VaultEntity['id'];
  clmId: VaultEntity['id'];
  count: number;
  totalUsd: BigNumber;
  onOpen: (clmId: VaultEntity['id']) => void;
};

const ClmListItem = memo(function ClmListItem({
  vaultId,
  clmId,
  count,
  totalUsd,
  onOpen,
}: ClmListItemProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const handleClick = useCallback(() => onOpen(clmId), [onOpen, clmId]);

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
          <TagLine>
            <VaultPlatformTag vaultId={vaultId} css={platformTagOverride} />
            <SideText>{t('Transact-DepositFromVault-Positions', { count })}</SideText>
          </TagLine>
        </VaultNameAndTags>
      </VaultLeft>
      <ListItemRightSide css={rightSideOverride}>
        <ListItemBalanceAmount className="vault-row-balance">
          {formatLargeUsd(totalUsd)}
        </ListItemBalanceAmount>
        <ChevronRight className={cx('list-item-arrow', css(listItemArrow))} />
      </ListItemRightSide>
    </VaultRowButton>
  );
});

export const ClmSideIcon = memo(function ClmSideIcon({ side }: { side: ClmSide }) {
  return (
    side === 'vault' ? <SmallAutocompound />
    : side === 'pool' ? <SmallClaimable />
    : <SmallWallet />
  );
});

/** a CLM position named as on the withdraw tab */
const ClmSideLabel = memo(function ClmSideLabel({ side }: { side: ClmSide }) {
  const { t } = useTranslation();
  return (
    <SideText>
      <ClmSideIcon side={side} />
      {t(CLM_SIDE_NAME[side])}
    </SideText>
  );
});

const TagLine = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
});

const SideText = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    textStyle: 'body.sm',
    color: 'text.dark',
    whiteSpace: 'nowrap',
  },
});

const smallIcon = {
  flex: 'none',
  width: '12px',
  height: '12px',
  color: 'text.middle',
} as const;

const SmallAutocompound = styled(AutocompoundIcon, { base: smallIcon });

const SmallClaimable = styled(ClaimableIcon, { base: smallIcon });

const SmallWallet = styled(WalletIcon, { base: smallIcon });

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
      clm: {
        backgroundColor: 'tagClmBackground',
      },
      thisClm: {
        backgroundColor: 'background.content.light',
        color: 'text.middle',
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
