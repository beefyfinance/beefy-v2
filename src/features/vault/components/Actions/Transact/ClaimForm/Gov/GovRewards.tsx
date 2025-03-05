import { memo, useMemo } from 'react';
import { type VaultEntity } from '../../../../../../data/entities/vault.ts';
import type { ChainEntity } from '../../../../../../data/entities/chain.ts';
import { useAppSelector } from '../../../../../../../store.ts';
import { BIG_ZERO } from '../../../../../../../helpers/big-number.ts';
import { selectUserGovVaultUnifiedRewards } from '../../../../../../data/selectors/user-rewards.ts';
import { Claim } from './Claim/Claim.tsx';
import { RewardList } from '../RewardList/RewardList.tsx';
import { Source } from '../Source/Source.tsx';
import { useTranslation } from 'react-i18next';

type GovRewardsProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  walletAddress?: string;
  deposited: boolean;
};

export const GovRewards = memo(function GovRewards({
  vaultId,
  chainId,
  walletAddress,
  deposited,
}: GovRewardsProps) {
  const { t } = useTranslation();
  const vaultRewards = useAppSelector(state =>
    selectUserGovVaultUnifiedRewards(state, vaultId, walletAddress)
  );
  const canClaim = useMemo(
    () => !!vaultRewards && vaultRewards.some(r => r.amount.gt(BIG_ZERO)),
    [vaultRewards]
  );

  if (!vaultRewards || vaultRewards.length === 0) {
    return null;
  }

  return (
    <Source
      title={t('Transact-Claim-Rewards-gov')}
      claim={canClaim ? <Claim vaultId={vaultId} /> : undefined}
    >
      <RewardList chainId={chainId} rewards={vaultRewards} deposited={deposited} />
    </Source>
  );
});
