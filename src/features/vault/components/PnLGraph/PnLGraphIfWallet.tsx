import { memo } from 'react';
import {
  isCowcentratedVault,
  isStandardVault,
  type VaultEntity,
} from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectWalletAddress } from '../../../data/selectors/wallet';
import {
  selectVaultById,
  selectVaultUnderlyingVaultOrUndefined,
} from '../../../data/selectors/vaults';
import { StandardPnLGraphLoader } from './standard/StandardPnLGraph';
import { CowcentratedPnlGraphLoader } from './cowcentrated';

type PnLGraphIfWalletProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
};

export const PnLGraphIfWallet = memo<PnLGraphIfWalletProps>(function PnLGraphIfWallet({
  vaultId,
  walletAddress,
}) {
  const actualWalletAddress = useAppSelector(state => walletAddress || selectWalletAddress(state));
  if (actualWalletAddress) {
    return <PnLGraph vaultId={vaultId} walletAddress={actualWalletAddress} />;
  }

  return null;
});

type PnLGraphProps = {
  vaultId: VaultEntity['id'];
  walletAddress: string;
};

export const PnLGraph = memo<PnLGraphProps>(function PnLGraph({ vaultId, walletAddress }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const underlyingVault = useAppSelector(state =>
    selectVaultUnderlyingVaultOrUndefined(state, vaultId)
  );

  if (isStandardVault(vault)) {
    return <StandardPnLGraphLoader vaultId={vaultId} address={walletAddress} />;
  }

  if (isCowcentratedVault(vault)) {
    return <CowcentratedPnlGraphLoader vaultId={vaultId} address={walletAddress} />;
  }

  if (underlyingVault && isCowcentratedVault(underlyingVault)) {
    return <CowcentratedPnlGraphLoader vaultId={underlyingVault.id} address={walletAddress} />;
  }

  return null;
});
