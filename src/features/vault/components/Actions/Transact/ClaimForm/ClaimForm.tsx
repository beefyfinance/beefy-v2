import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { isCowcentratedLikeVault, isGovVault } from '../../../../../data/entities/vault.ts';
import { selectHasUserDepositInVault } from '../../../../../data/selectors/balance.ts';
import {
  selectVaultHasActiveMerklCampaigns,
  selectVaultHasActiveStellaSwapCampaigns,
} from '../../../../../data/selectors/rewards.ts';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectWalletAddress } from '../../../../../data/selectors/wallet.ts';
import { GovRewards } from './Gov/GovRewards.tsx';
import { MerklRewards } from './Merkl/MerklRewards.tsx';
import { StellaSwapRewards } from './StellaSwap/StellaSwapRewards.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

const ClaimFormLoader = memo(function ClaimFormLoader() {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const walletAddress = useAppSelector(selectWalletAddress);
  const deposited = useAppSelector(state => selectHasUserDepositInVault(state, vaultId));
  const hasActiveMerkl = useAppSelector(state =>
    selectVaultHasActiveMerklCampaigns(state, vaultId)
  );
  const hasActiveStellaSwap = useAppSelector(state =>
    selectVaultHasActiveStellaSwapCampaigns(state, vaultId)
  );
  const isCowcentratedLike = isCowcentratedLikeVault(vault);

  const rewardType = useMemo(() => {
    let type = vault.type;
    if (isGovVault(vault) && isCowcentratedLike) {
      type += `-cowcentrated`;
    }
    if (isCowcentratedLike) {
      type += `-${vault.strategyTypeId}`;
    }
    if (hasActiveMerkl) {
      type += '-merkl';
    }
    if (hasActiveStellaSwap) {
      type += '-stellaswap';
    }
    return type;
  }, [vault, isCowcentratedLike, hasActiveMerkl, hasActiveStellaSwap]);
  const descriptionKey = `Transact-Claim-Description-${rewardType}`;

  return (
    <div className={classes.container}>
      <div className={classes.description}>{t(descriptionKey)}</div>
      {isGovVault(vault) ?
        <GovRewards
          vaultId={vault.id}
          chainId={vault.chainId}
          walletAddress={walletAddress}
          deposited={deposited}
        />
      : null}
      <MerklRewards
        vaultId={vault.id}
        chainId={vault.chainId}
        walletAddress={walletAddress}
        deposited={deposited}
      />
      <StellaSwapRewards
        vaultId={vault.id}
        chainId={vault.chainId}
        walletAddress={walletAddress}
        deposited={deposited}
      />
    </div>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default ClaimFormLoader;
