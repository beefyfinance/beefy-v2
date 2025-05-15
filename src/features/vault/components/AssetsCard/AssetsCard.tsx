import { memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { TokenCard } from '../DetailsCards/TokenCard.tsx';

interface AssetsCardProps {
  vaultId: VaultEntity['id'];
}

export const AssetsCard = memo(function AssetsCard({ vaultId }: AssetsCardProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <>
      {vault.assetIds.map(tokenId => (
        <TokenCard key={tokenId} chainId={vault.chainId} tokenId={tokenId} />
      ))}
    </>
  );
});
