import { memo } from 'react';
import {
  isCowcentratedLikeVault,
  isErc4626Vault,
  isStandardVault,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { useAppSelector } from '../../../../store.ts';
import { selectWalletAddress } from '../../../data/selectors/wallet.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { StandardPnLGraphLoader } from './standard/StandardPnLGraph.tsx';
import { CowcentratedPnlGraphLoader } from './cowcentrated/CowcentratedPnlGraph.tsx';

type PnLGraphIfWalletProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
};

export const PnLGraphIfWallet = memo(function PnLGraphIfWallet({
  vaultId,
  walletAddress,
}: PnLGraphIfWalletProps) {
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

export const PnLGraph = memo(function PnLGraph({ vaultId, walletAddress }: PnLGraphProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (isCowcentratedLikeVault(vault)) {
    return <CowcentratedPnlGraphLoader vaultId={vaultId} address={walletAddress} />;
  }

  if (isStandardVault(vault) || isErc4626Vault(vault)) {
    return <StandardPnLGraphLoader vaultId={vaultId} address={walletAddress} />;
  }

  return null;
});
