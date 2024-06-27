import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { isGovVault } from '../../../../../data/entities/vault';
import { selectTransactVaultId } from '../../../../../data/selectors/transact';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectWalletAddress } from '../../../../../data/selectors/wallet';
import { selectHasUserDepositInVault } from '../../../../../data/selectors/balance';
import { MerklRewards } from './Merkl/MerklRewards';
import { GovRewards } from './Gov/GovRewards';
import { selectVaultHasActiveMerklCampaigns } from '../../../../../data/selectors/rewards';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export const ClaimFormLoader = memo(function ClaimFormLoader() {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const walletAddress = useAppSelector(selectWalletAddress);
  const deposited = useAppSelector(state => selectHasUserDepositInVault(state, vaultId));
  const hasActiveMerkl = useAppSelector(state =>
    selectVaultHasActiveMerklCampaigns(state, vaultId)
  );
  const descriptionKey = `Transact-Claim-Description-${vault.type}${
    hasActiveMerkl ? '-merkl' : ''
  }`;

  return (
    <div className={classes.container}>
      <div className={classes.description}>{t(descriptionKey)}</div>
      {isGovVault(vault) ? (
        <GovRewards
          vaultId={vault.id}
          chainId={vault.chainId}
          walletAddress={walletAddress}
          deposited={deposited}
        />
      ) : null}
      <MerklRewards
        vaultId={vault.id}
        chainId={vault.chainId}
        walletAddress={walletAddress}
        deposited={deposited}
      />
    </div>
  );
});
