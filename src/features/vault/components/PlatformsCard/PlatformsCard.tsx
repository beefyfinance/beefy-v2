import { memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectPlatformById } from '../../../data/selectors/platforms.ts';
import { selectTokenByAddress } from '../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { PlatformCard } from '../DetailsCards/PlatformCard.tsx';

interface PlatformsCardProps {
  vaultId: VaultEntity['id'];
}

export const PlatformsCard = memo(function PlatformsCard({ vaultId }: PlatformsCardProps) {
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
      {provider && provider.id !== platform.id ?
        <PlatformCard key={provider.id} platformId={provider.id} />
      : null}
      <PlatformCard key={platform.id} platformId={platform.id} />
    </>
  );
});
