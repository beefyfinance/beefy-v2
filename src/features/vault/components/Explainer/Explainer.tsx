import { lazy, memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import {
  isCowcentratedLikeVault,
  isErc4626Vault,
  isGovVault,
  isStandardVault,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';

const StandardExplainer = lazy(() => import('./Standard/StandardExplainer.tsx'));
const GovExplainer = lazy(() => import('./Gov/GovExplainer.tsx'));
const CowcentratedExplainer = lazy(() => import('./Cowcentrated/CowcentratedExplainer.tsx'));
const Erc4626Explainer = lazy(() => import('./Erc4626/Erc4626Explainer.tsx'));

export type ExplainerProps = {
  vaultId: VaultEntity['id'];
};

export const Explainer = memo(function Explainer({ vaultId }: ExplainerProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (isCowcentratedLikeVault(vault)) {
    return <CowcentratedExplainer vaultId={vaultId} />;
  } else if (isStandardVault(vault)) {
    return <StandardExplainer vaultId={vaultId} />;
  } else if (isErc4626Vault(vault)) {
    return <Erc4626Explainer vaultId={vaultId} />;
  } else if (isGovVault(vault)) {
    return <GovExplainer vaultId={vaultId} />;
  }
  return null;
});
