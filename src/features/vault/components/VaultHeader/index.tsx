import { memo } from 'react';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  type VaultEntity,
} from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { useAppSelector } from '../../../../store';
import { selectChainById } from '../../../data/selectors/chains';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { AssetsImage } from '../../../../components/AssetsImage';
import { VaultPlatform } from '../../../../components/VaultPlatform';
import { styles } from './styles';
import { ShareButton } from '../ShareButton';
import { punctuationWrap } from '../../../../helpers/string';
import { SaveButton } from '../SaveButton';
import { selectVaultTokenSymbols } from '../../../data/selectors/tokens';
import { VaultClmLikeTag } from '../../../../components/VaultIdentity/components/VaultTags';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type VaultHeaderProps = {
  vaultId: VaultEntity['id'];
};
export const VaultHeader = memo<VaultHeaderProps>(function VaultHeader({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const vaultTokenSymbols = useAppSelector(state => selectVaultTokenSymbols(state, vaultId));
  const isCowcentratedLike = isCowcentratedLikeVault(vault);

  return (
    <div className={classes.header}>
      <div
        className={clsx(classes.titleHolder, {
          [classes.titleHolderWithTag]: !!isCowcentratedLike,
        })}
      >
        <AssetsImage
          assetSymbols={vaultTokenSymbols}
          size={48}
          chainId={vault.chainId}
          className={classes.titleAsset}
        />
        <div className={classes.title}>{punctuationWrap(vault.names.list)}</div>
        {isCowcentratedLike ? (
          <VaultClmLikeTag
            vault={vault}
            hideFee={isCowcentratedGovVault(vault) ? true : undefined}
            className={classes.titleTag}
          />
        ) : null}
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
          <SaveButton vaultId={vaultId} />
          {vault.status === 'active' ? (
            <ShareButton hideText={true} vaultId={vaultId} mobileAlternative={true} />
          ) : null}
        </div>
      </div>
    </div>
  );
});
