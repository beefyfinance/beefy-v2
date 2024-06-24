import { memo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectChainById } from '../../features/data/selectors/chains';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';
import { selectPlatformById } from '../../features/data/selectors/platforms';
import { Meta } from './Meta';

export type VaultMetaProps = {
  vaultId: VaultEntity['id'];
};
export const VaultMeta = memo<VaultMetaProps>(function VaultMeta({ vaultId }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));

  return (
    <Meta
      title={t('Meta-Vault-Title', { vault: vault.longName, chain: chain.name })}
      description={t('Meta-Vault-Description', {
        token: depositToken.symbol,
        chain: chain.name,
        platform: platform.name,
      })}
    />
  );
});
