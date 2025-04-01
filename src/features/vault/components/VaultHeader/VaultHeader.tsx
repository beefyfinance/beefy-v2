import { memo } from 'react';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { useAppSelector } from '../../../../store.ts';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { AssetsImage } from '../../../../components/AssetsImage/AssetsImage.tsx';
import { VaultPlatform } from '../../../../components/VaultPlatform/VaultPlatform.tsx';
import { styles } from './styles.ts';
import { ShareButton } from '../ShareButton/ShareButton.tsx';
import { punctuationWrap } from '../../../../helpers/string.ts';
import { SaveButton } from '../SaveButton/SaveButton.tsx';
import { selectVaultTokenSymbols } from '../../../data/selectors/tokens.ts';
import { VaultClmLikeTag } from '../../../../components/VaultIdentity/components/VaultTags/VaultTags.tsx';
import { css } from '@repo/styles/css';
import { selectActivePromoForVault } from '../../../data/selectors/promos.ts';

const useStyles = legacyMakeStyles(styles);

export type VaultHeaderProps = {
  vaultId: VaultEntity['id'];
};
export const VaultHeader = memo(function VaultHeader({ vaultId }: VaultHeaderProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const vaultTokenSymbols = useAppSelector(state => selectVaultTokenSymbols(state, vaultId));
  const isCowcentratedLike = isCowcentratedLikeVault(vault);
  const promo = useAppSelector(state => selectActivePromoForVault(state, vaultId));

  return (
    <div className={classes.header}>
      <div className={css(styles.titleHolder, !!isCowcentratedLike && styles.titleHolderClm)}>
        <div
          className={css(
            styles.title,
            !!isCowcentratedLike && styles.titleClm,
            promo?.type === 'boost' && styles.titleBoost
          )}
        >
          {punctuationWrap(vault.names.list)}
        </div>
        <AssetsImage
          assetSymbols={vaultTokenSymbols}
          size={48}
          chainId={vault.chainId}
          css={!!isCowcentratedLike && styles.titleAssetClm}
        />
        {isCowcentratedLike ? (
          <VaultClmLikeTag
            vault={vault}
            hideFee={isCowcentratedGovVault(vault) ? true : undefined}
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
