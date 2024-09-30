import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  isCowcentratedStandardVault,
  isGovVault,
  isGovVaultCowcentrated,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultStandardCowcentrated,
} from '../../features/data/entities/vault';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { useAppSelector } from '../../store';
import {
  selectVaultById,
  selectVaultLastHarvestByVaultId,
} from '../../features/data/selectors/vaults';
import { formatDistanceToNowStrict } from 'date-fns';

type LastHarvestProps = { vaultId: VaultEntity['id'] };

export const LastHarvest = memo<LastHarvestProps>(function LastHarvest({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (isCowcentratedStandardVault(vault)) {
    return <LastHarvestCowcentrated vaultId={vault.id} clmId={vault.cowcentratedIds.clm} />;
  }

  if (isGovVault(vault) && !isGovVaultCowcentrated(vault)) {
    return null;
  }

  return <LastHarvestStandard vaultId={vaultId} />;
});

function formatLastHarvest(unixTime: number): string {
  if (unixTime === 0) {
    return '-';
  } else {
    return formatDistanceToNowStrict(unixTime, {
      addSuffix: true,
    });
  }
}

export const LastHarvestStandard = memo<LastHarvestProps>(function LastHarvestStandard({
  vaultId,
}) {
  const { t } = useTranslation();
  const lastHarvest = useAppSelector(state => selectVaultLastHarvestByVaultId(state, vaultId));
  const formatted = useMemo(() => formatLastHarvest(lastHarvest), [lastHarvest]);

  return <ValueBlock label={t('Vault-LastHarvest')} value={formatted} />;
});

type LastHarvestCowcentratedProps = {
  vaultId: VaultStandardCowcentrated['id'];
  clmId: VaultCowcentrated['id'];
};

export const LastHarvestCowcentrated = memo<LastHarvestCowcentratedProps>(
  function LastHarvestCowcentrated({ vaultId, clmId }) {
    const { t } = useTranslation();
    const vaultLastHarvest = useAppSelector(state =>
      selectVaultLastHarvestByVaultId(state, vaultId)
    );
    const clmLastHarvest = useAppSelector(state => selectVaultLastHarvestByVaultId(state, clmId));
    const formatted = useMemo(
      () => ({
        vault: formatLastHarvest(vaultLastHarvest),
        clm: formatLastHarvest(clmLastHarvest),
      }),
      [vaultLastHarvest, clmLastHarvest]
    );

    if (!vaultLastHarvest && !clmLastHarvest) {
      return <ValueBlock label={t('Vault-LastHarvest')} value="-" />;
    }

    return (
      <ValueBlock
        label={t('Vault-LastHarvest')}
        value={formatted.vault}
        usdValue={clmLastHarvest ? `CLM Pool: ${formatted.clm}` : undefined}
      />
    );
  }
);
