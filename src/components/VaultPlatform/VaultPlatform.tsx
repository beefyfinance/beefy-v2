import { selectPlatformById } from '../../features/data/selectors/platforms';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultEntity } from '../../features/data/entities/vault';
import { useAppSelector } from '../../store';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export type VaultPlatformProps = {
  vaultId: VaultEntity['id'];
};
export const VaultPlatform = memo<VaultPlatformProps>(function VaultPlatform({ vaultId }) {
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
