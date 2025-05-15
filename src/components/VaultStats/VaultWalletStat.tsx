import { memo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectIsBalanceAvailableForChainUser,
  selectUserBalanceOfToken,
} from '../../features/data/selectors/balance.ts';

import { selectIsPricesAvailable } from '../../features/data/selectors/prices.ts';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../features/data/selectors/tokens.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  selectIsBalanceHidden,
  selectWalletAddress,
} from '../../features/data/selectors/wallet.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { useTranslation } from 'react-i18next';

export type VaultWalletStatProps = {
  vaultId: VaultEntity['id'];
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultWalletStat>>;

export const VaultWalletStat = memo(function ({ vaultId, ...passthrough }: VaultWalletStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, ...statProps } = useAppSelector(state => selectVaultWalletStat(state, vaultId));
  return <VaultValueStat label={t(label)} {...statProps} {...passthrough} />;
});

// TODO better selector / hook
function selectVaultWalletStat(state: BeefyState, vaultId: VaultEntity['id']) {
  const label = 'VaultStat-WALLET';
  const vault = selectVaultById(state, vaultId);
  const hideBalance = selectIsBalanceHidden(state);
  const walletAddress = selectWalletAddress(state);

  if (!walletAddress) {
    return {
      label,
      value: '0',
      subValue: null,
      blur: hideBalance,
      loading: false,
    };
  }

  const isLoaded =
    selectIsPricesAvailable(state) &&
    selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);
  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: hideBalance,
      loading: true,
      expectSubValue: true,
    };
  }

  const tokensInWallet = selectUserBalanceOfToken(state, vault.chainId, vault.depositTokenAddress);

  if (!tokensInWallet.gt(0)) {
    return {
      label,
      value: '0',
      subValue: null,
      blur: hideBalance,
      loading: false,
    };
  }

  const price = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const totalInWallet = formatTokenDisplayCondensed(tokensInWallet, depositToken.decimals, 6);
  const totalInWalletUsd = formatLargeUsd(tokensInWallet.times(price));

  return {
    label,
    value: totalInWallet,
    subValue: totalInWalletUsd,
    blur: hideBalance,
    loading: false,
  };
}
