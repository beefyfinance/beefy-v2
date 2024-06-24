import {
  isCowcentratedVault,
  isStandardVault,
  type VaultEntity,
} from '../../../data/entities/vault';
import { lazy, memo } from 'react';
import { useAppSelector } from '../../../../store';
import {
  selectVaultById,
  selectVaultUnderlyingCowcentratedVaultOrUndefined,
} from '../../../data/selectors/vaults';

const StandardExplainer = lazy(() => import(`./Standard`));
const GovExplainer = lazy(() => import(`./Gov`));
const CowcentratedExplainer = lazy(() => import(`./Cowcentrated`));

export type ExplainerProps = {
  vaultId: VaultEntity['id'];
};

export const Explainer = memo<ExplainerProps>(function Explainer({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const underlyingVault = useAppSelector(state =>
    selectVaultUnderlyingCowcentratedVaultOrUndefined(state, vaultId)
  );

  if (isStandardVault(vault)) {
    return <StandardExplainer vaultId={vaultId} />;
  }

  if (isCowcentratedVault(vault)) {
    return <CowcentratedExplainer vaultId={vaultId} />;
  }

  if (underlyingVault && isCowcentratedVault(underlyingVault)) {
    return <CowcentratedExplainer vaultId={underlyingVault.id} poolId={vaultId} />;
  }

  return <GovExplainer vaultId={vaultId} />;
});
