import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_ZERO } from '../../../../../../../helpers/big-number.ts';
import { useAppSelector } from '../../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../../data/entities/chain.ts';
import { type VaultEntity } from '../../../../../../data/entities/vault.ts';
import { selectUserGovVaultUnifiedRewards } from '../../../../../../data/selectors/user-rewards.ts';
import { RewardList } from '../RewardList.tsx';
import { Source } from '../Source/Source.tsx';
import { Claim } from './Claim/Claim.tsx';

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
