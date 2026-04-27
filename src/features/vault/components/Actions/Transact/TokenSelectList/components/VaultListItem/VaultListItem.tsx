import { css, type CssStyles, cx } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../../../data/entities/chain.ts';
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

/**
 * Row variant rendered by the cross-chain picker when a selection references a
 * whole vault rather than a token (vault-to-vault options).
 *
 * Deposit side (`vault-src`): user holds shares in a vault on another chain
 * and wants to redeploy into the page vault. Show vault name, chain badge,
 * and the user's balance so they can confirm the source before picking it.
 *
 * Withdraw side (`vault-dst`): user is exiting the page vault and targeting a
 * vault on another chain. No user balance to surface yet — show the vault's
 * APY instead so the picker doubles as a yield comparison.
 */
export type VaultListItemProps = {
  selectionId: string;
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  /** Defined for deposit side (src-vault) when a wallet is connected. */
  balance?: BigNumber;
  balanceValue?: BigNumber;
  /** Share-token decimals; used to format the balance line. */
  decimals: number;
  /** Controls what the right column displays. */
  mode: 'vault-src' | 'vault-dst';
  onSelect: (id: string) => void;
  css?: CssStyles;
};

export const VaultListItem = memo(function VaultListItem({
  selectionId,
  vaultId,
  chainId,
  balance,
  balanceValue,
  decimals,
  mode,
  css: cssProp,
  onSelect,
}: VaultListItemProps) {
  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, chainId));
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
        <VaultNetwork chainId={chainId} />
        <VaultIcon vaultId={vaultId} size={24} />
        <ListItemName>
          {punctuationWrap(vault.names.list)}
          <span
            className={css({
              textStyle: 'body.sm',
              color: 'text.dark',
              marginLeft: '8px',
            })}
          >
            {chain.name}
          </span>
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
