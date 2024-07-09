import { memo, useMemo } from 'react';
import { type VaultEntity } from '../../../../../../data/entities/vault';
import type { ChainEntity } from '../../../../../../data/entities/chain';
import { useAppSelector } from '../../../../../../../store';
import { BIG_ZERO } from '../../../../../../../helpers/big-number';
import { selectUserGovVaultUnifiedRewards } from '../../../../../../data/selectors/user-rewards';
import { Claim } from './Claim/Claim';
import { RewardList } from '../RewardList/RewardList';
import { Source } from '../Source/Source';
import { useTranslation } from 'react-i18next';

type GovRewardsProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  walletAddress?: string;
  deposited: boolean;
};

export const GovRewards = memo<GovRewardsProps>(function GovRewards({
  vaultId,
  walletAddress,
  deposited,
}) {
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
      <RewardList rewards={vaultRewards} deposited={deposited} />
    </Source>
  );
});
