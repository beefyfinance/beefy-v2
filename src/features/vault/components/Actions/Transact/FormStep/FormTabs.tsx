import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSwitchMode } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactMode,
  selectTransactShouldShowBoost,
  selectTransactShouldShowBoostNotification,
  selectTransactShouldShowClaims,
  selectTransactShouldShowClaimsNotification,
  selectTransactShouldShowMigrate,
  selectTransactShouldShowWithdrawNotification,
} from '../../../../../data/selectors/transact.ts';
import { selectClmClaimVaultId } from '../../../../../data/selectors/vaults.ts';
import type { BeefyState } from '../../../../../data/store/types.ts';
import { CardHeaderTabs } from '../../../Card/CardHeaderTabs.tsx';
import {
  HighlightableTab,
  type HighlightableTabOption,
} from '../../../Card/CardHighlightableTab.tsx';

export type FormTabsProps = {
  /**
   * The vault the form is for, taken from the page rather than the store: during a yield-mode
   * switch the store's vault id is momentarily cleared, and the tabs must not disappear with it.
   */
  vaultId: VaultEntity['id'];
};

export const FormTabs = memo(function FormTabs({ vaultId }: FormTabsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  // claims live on the CLM's pool side whatever the yield mode is
  const claimVaultId = useAppSelector(state => selectClmClaimVaultId(state, vaultId));
  const showClaim = useAppSelector(state => selectTransactShouldShowClaims(state, claimVaultId));
  const showBoost = useAppSelector(state => selectTransactShouldShowBoost(state, vaultId));
  const showMigrate = useAppSelector(state => selectTransactShouldShowMigrate(state, vaultId));

  const handleModeChange = useCallback(
    (newMode: string) => {
      dispatch(transactSwitchMode(parseInt(newMode)));
    },
    [dispatch]
  );

  const modeOptions = useMemo(
    () =>
      [
        ...(showMigrate ?
          [{ value: TransactMode.Migrate.toString(), label: t('Transact-Migrate') }]
        : []),
        { value: TransactMode.Deposit.toString(), label: t('Transact-Deposit') },
        ...(showClaim ?
          [
            {
              value: TransactMode.Claim.toString(),
              label: t('Transact-Claim'),
              context: {
                shouldHighlight: (state: BeefyState) =>
                  selectTransactShouldShowClaimsNotification(state, claimVaultId),
              },
            },
          ]
        : []),
        ...(showBoost ?
          [
            {
              value: TransactMode.Boost.toString(),
              label: t('Transact-Boost'),
              context: {
                shouldHighlight: (state: BeefyState) =>
                  selectTransactShouldShowBoostNotification(state, vaultId),
              },
            },
          ]
        : []),
        {
          value: TransactMode.Withdraw.toString(),
          label: t('Transact-Withdraw'),
          context: {
            shouldHighlight: (state: BeefyState) =>
              selectTransactShouldShowWithdrawNotification(state, vaultId),
          },
        },
      ] satisfies Array<HighlightableTabOption>,
    [t, vaultId, claimVaultId, showClaim, showBoost, showMigrate]
  );

  return (
    <CardHeaderTabs
      selected={mode.toString()}
      options={modeOptions}
      onChange={handleModeChange}
      TabComponent={HighlightableTab}
    />
  );
});
