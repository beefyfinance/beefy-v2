import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  isStandardVault,
  type VaultEntity,
} from '../../../data/entities/vault';
import { lazy, memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';

const StandardExplainer = lazy(() => import(`./Standard`));
const GovExplainer = lazy(() => import(`./Gov`));
const CowcentratedExplainer = lazy(() => import(`./Cowcentrated`));

export type ExplainerProps = {
  vaultId: VaultEntity['id'];
};

export const Explainer = memo<ExplainerProps>(function Explainer({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (isStandardVault(vault)) {
    return <StandardExplainer vaultId={vaultId} />;
  }

  if (isCowcentratedVault(vault)) {
    return <CowcentratedExplainer vaultId={vaultId} />;
  }

  if (isCowcentratedLikeVault(vault)) {
    // TODO fix for cowcentrated standard vaults
    return <CowcentratedExplainer vaultId={vault.cowcentratedId} poolId={vaultId} />;
  }

  return <GovExplainer vaultId={vaultId} />;
});
