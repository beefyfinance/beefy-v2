import * as React from 'react';
import { memo } from 'react';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { useAppSelector } from '../../../../store';
import { selectChainById } from '../../../data/selectors/chains';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { AssetsImage } from '../../../../components/AssetsImage';
import { VaultPlatform } from '../../../../components/VaultPlatform';
import { styles } from './styles';
import { ShareButton } from '../ShareButton';

const useStyles = makeStyles(styles);

export type VaultHeaderProps = {
  vaultId: VaultEntity['id'];
};
export const VaultHeader = memo<VaultHeaderProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));

  return (
    <div className={classes.header}>
      <div className={classes.titleHolder}>
        <AssetsImage assetIds={vault.assetIds} size={48} chainId={vault.chainId} />
        <h1 className={classes.title}>
          {vault.name} {!isGovVault(vault) ? t('Vault-vault') : ''}
        </h1>
      </div>
      <div className={classes.labelsHolder}>
        <div className={classes.platformLabel}>
          {t('Chain')} <span>{chain.name}</span>
        </div>
        <div className={classes.platformLabel}>
          {t('Platform')}{' '}
          <span>
            <VaultPlatform vaultId={vaultId} />
          </span>
        </div>
        <div className={classes.shareHolder}>
          <ShareButton vaultId={vaultId} campaign="share-vault-page" />
        </div>
      </div>
    </div>
  );
});
