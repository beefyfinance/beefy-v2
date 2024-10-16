import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { TokenCard } from '../DetailsCards';

interface AssetsCardProps {
  vaultId: VaultEntity['id'];
}

export const AssetsCard = memo<AssetsCardProps>(function AssetsCard({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <>
      {vault.assetIds.map(tokenId => (
        <TokenCard key={tokenId} chainId={vault.chainId} tokenId={tokenId} />
      ))}
    </>
  );
});
