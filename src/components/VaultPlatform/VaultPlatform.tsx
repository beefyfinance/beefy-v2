import { selectPlatformById } from '../../features/data/selectors/platforms.ts';
import { selectTokenByAddress } from '../../features/data/selectors/tokens.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { useAppSelector } from '../../store.ts';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export type VaultPlatformProps = {
  vaultId: VaultEntity['id'];
};
export const VaultPlatform = memo(function VaultPlatform({ vaultId }: VaultPlatformProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const provider = useAppSelector(state =>
    depositToken.providerId ? selectPlatformById(state, depositToken.providerId) : null
  );
  const platformName = platform.name;
  const providerName = provider ? provider.name : null;

  return (
    <>
      {providerName && providerName !== platformName
        ? t('VaultTag-PlatformWithProvider', { platform: platformName, provider: providerName })
        : t('VaultTag-Platform', { platform: platformName })}
    </>
  );
});
