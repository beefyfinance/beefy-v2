import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { PlatformCard } from '../DetailsCards';
import { selectPlatformById } from '../../../data/selectors/platforms';
import { selectTokenByAddress } from '../../../data/selectors/tokens';

interface PlatformsCardProps {
  vaultId: VaultEntity['id'];
}

export const PlatformsCard = memo<PlatformsCardProps>(function PlatformsCard({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const provider = useAppSelector(state =>
    depositToken.providerId ? selectPlatformById(state, depositToken.providerId) : null
  );

  return (
    <>
      {provider && provider.id !== platform.id ? (
        <PlatformCard key={provider.id} platformId={provider.id} />
      ) : null}
      <PlatformCard key={platform.id} platformId={platform.id} />
    </>
  );
});
