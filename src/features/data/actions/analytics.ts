import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getAnalyticsApi } from '../apis/instances';
import { selectUserDepositedVaultIds } from '../selectors/balance';
import { VaultTimelineAnalyticsEntity } from '../entities/analytics';
import BigNumber from 'bignumber.js';

export interface FetchAnalyticsVaultsFullfilled {
  [vaultId: string]: VaultTimelineAnalyticsEntity[];
}

export const fetchAnalyticsVaults = createAsyncThunk<
  FetchAnalyticsVaultsFullfilled,
  { address: string },
  { state: BeefyState }
>('analytics/fetchVaults', async ({ address }, { getState }) => {
  const api = await getAnalyticsApi();

  const userVaults = selectUserDepositedVaultIds(getState());
  const userTimeline = await api.getUserVaults(address);

  const vaults = userTimeline.filter(vaultTimeline =>
    userVaults.includes(vaultTimeline.display_name)
  );

  const totals: FetchAnalyticsVaultsFullfilled = {};

  for (const vault of vaults) {
    const vaultHistory = totals[vault.display_name] || [];

    const parsedVault = {
      chain: vault.chain,
      datetime: new Date(vault.datetime),
      displayName: vault.display_name,
      isEol: vault.is_eol,
      productKey: vault.product_key,
      shareBalance: new BigNumber(vault.share_balance),
      shareDiff: new BigNumber(vault.share_diff),
      shareToUnderlyingPrice: new BigNumber(vault.share_to_underlying_price),
      underlyingBalance: new BigNumber(vault.underlying_balance),
      underlyingDiff: new BigNumber(vault.underlying_diff),
      underlyingToUsdPrice: new BigNumber(vault.underlying_to_usd_price),
      usdBalance: new BigNumber(vault.usd_balance),
      usdDiff: new BigNumber(vault.usd_diff),
    };

    vaultHistory.push(parsedVault);

    totals[vault.display_name] = vaultHistory;
  }

  return totals;
});
