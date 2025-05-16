import { memo } from 'react';
import { Trans } from 'react-i18next';
import { type VaultEntity, type VaultErc4626 } from '../../../../data/entities/vault.ts';
import { type CommonHelper, isErc4626Helper, useCommonHelper } from './common.ts';

type Erc4626Helper = CommonHelper<VaultErc4626>;

function useErc4626Helper(vaultId: VaultEntity['id']): Erc4626Helper {
  const helper = useCommonHelper(vaultId);
  if (!isErc4626Helper(helper)) {
    throw new Error('This hook is only for erc4626 vaults');
  }

  return helper;
}

export type Erc4626DescriptionProps = {
  vaultId: VaultEntity['id'];
};

export const Erc4626Description = memo(function Erc4626Description({
  vaultId,
}: Erc4626DescriptionProps) {
  const { i18n } = useErc4626Helper(vaultId);
  return <Trans {...i18n} />;
});
