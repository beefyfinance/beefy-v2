import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectChainById } from '../../features/data/selectors/chains.ts';
import { selectPlatformById } from '../../features/data/selectors/platforms.ts';
import { selectTokenByAddress } from '../../features/data/selectors/tokens.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { Meta } from './Meta.tsx';

export type VaultMetaProps = {
  vaultId: VaultEntity['id'];
};
export const VaultMeta = memo(function VaultMeta({ vaultId }: VaultMetaProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));

  return (
    <Meta
      title={t('Meta-Vault-Title', { vault: vault.names.singleMeta, chain: chain.name })}
      description={t('Meta-Vault-Description', {
        token: depositToken.symbol,
        chain: chain.name,
        platform: platform.name,
      })}
    />
  );
});
