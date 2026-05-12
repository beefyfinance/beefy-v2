import { css, type CssStyles, cx } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../../../data/entities/vault.ts';
import { selectChainById } from '../../../../../../../data/selectors/chains.ts';
import { selectVaultById } from '../../../../../../../data/selectors/vaults.ts';
import { selectVaultTotalApyOrUndefined } from '../../../../../../../data/selectors/apy.ts';
import { VaultIcon } from '../../../../../../../../components/VaultIdentity/components/VaultIcon/VaultIcon.tsx';
import { VaultNetwork } from '../../../../../../../../components/VaultIdentity/VaultIdentity.tsx';
import ChevronRight from '../../../../../../../../images/icons/chevron-right.svg?react';
import {
  formatLargePercent,
  formatLargeUsd,
  formatTokenDisplayCondensed,
} from '../../../../../../../../helpers/format.ts';
import { punctuationWrap } from '../../../../../../../../helpers/string.ts';
import {
  ListItemBalanceAmount,
  ListItemBalanceColumn,
  ListItemBalanceUsd,
  ListItemButton,
  ListItemName,
  ListItemRightSide,
  ListItemSide,
} from '../../../common/CommonListStyles.tsx';
import { listItemArrow } from '../../../common/CommonListStylesRaw.ts';

const chainNameClass = css({
  textStyle: 'body.sm',
  color: 'text.dark',
  marginLeft: '8px',
});

export type VaultListItemProps = {
  selectionId: string;
  vaultId: VaultEntity['id'];
  /** Defined for deposit side (src-vault) when a wallet is connected. */
  balance?: BigNumber;
  balanceValue?: BigNumber;
  decimals: number;
  mode: 'vault-src' | 'vault-dst';
  onSelect: (id: string) => void;
  css?: CssStyles;
};

export const VaultListItem = memo(function VaultListItem({
  selectionId,
  vaultId,
  balance,
  balanceValue,
  decimals,
  mode,
  css: cssProp,
  onSelect,
}: VaultListItemProps) {
  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const totalApy = useAppSelector(state => selectVaultTotalApyOrUndefined(state, vaultId));

  const balanceValueFormatted = useMemo(() => {
    if (!balanceValue || balanceValue.isZero()) return null;
    if (balanceValue.lt(0.01)) return '<$0.01';
    return formatLargeUsd(balanceValue);
  }, [balanceValue]);

  const apyFormatted = useMemo(() => {
    if (!totalApy || typeof totalApy.totalApy !== 'number') return null;
    return formatLargePercent(totalApy.totalApy, 2, '?');
  }, [totalApy]);

  return (
    <ListItemButton type="button" css={cssProp} onClick={handleClick}>
      <ListItemSide>
        <VaultNetwork chainId={vault.chainId} />
        <VaultIcon vaultId={vaultId} size={24} />
        <ListItemName>
          {punctuationWrap(vault.names.list)}
          <span className={chainNameClass}>{chain.name}</span>
        </ListItemName>
      </ListItemSide>
      <ListItemRightSide>
        {mode === 'vault-src' && balance ?
          <ListItemBalanceColumn>
            <ListItemBalanceAmount>
              {formatTokenDisplayCondensed(balance, decimals, 8)}
            </ListItemBalanceAmount>
            {balanceValueFormatted != null ?
              <ListItemBalanceUsd>{balanceValueFormatted}</ListItemBalanceUsd>
            : null}
          </ListItemBalanceColumn>
        : mode === 'vault-dst' && apyFormatted ?
          <ListItemBalanceColumn>
            <ListItemBalanceAmount>{apyFormatted} APY</ListItemBalanceAmount>
          </ListItemBalanceColumn>
        : null}
        <ChevronRight className={cx('list-item-arrow', css(listItemArrow))} />
      </ListItemRightSide>
    </ListItemButton>
  );
});
