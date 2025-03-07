import {
  isCowcentratedLikeVault,
  isStandardVault,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { lazy, memo } from 'react';
import { useAppSelector } from '../../../../store.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';

const StandardExplainer = lazy(() => import('./Standard/StandardExplainer.tsx'));
const GovExplainer = lazy(() => import('./Gov/GovExplainer.tsx'));
const CowcentratedExplainer = lazy(() => import('./Cowcentrated/CowcentratedExplainer.tsx'));

export type ExplainerProps = {
  vaultId: VaultEntity['id'];
};

export const Explainer = memo(function Explainer({ vaultId }: ExplainerProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (isCowcentratedLikeVault(vault)) {
    return <CowcentratedExplainer vaultId={vaultId} />;
  }

  if (isStandardVault(vault)) {
    return <StandardExplainer vaultId={vaultId} />;
  }

  return <GovExplainer vaultId={vaultId} />;
});
