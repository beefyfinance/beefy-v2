import * as React from 'react';
import { memo } from 'react';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { Meta } from '../../../../components/Meta/Meta';
import { selectVaultById } from '../../../data/selectors/vaults';
import { useAppSelector } from '../../../../store';
import { selectChainById } from '../../../data/selectors/chains';
import { useTranslation } from 'react-i18next';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { selectPlatformById } from '../../../data/selectors/platforms';

export type VaultMetaProps = {
  vaultId: VaultEntity['id'];
};
export const VaultMeta = memo<VaultMetaProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const titleKey = isGovVault(vault) ? 'Meta-Vault-Title-Gov' : 'Meta-Vault-Title';

  return (
    <Meta
      title={t(titleKey, { vault: vault.name, chain: chain.name })}
      description={t('Meta-Vault-Description', {
        token: depositToken.symbol,
        chain: chain.name,
        platform: platform.name,
      })}
    />
  );
});
