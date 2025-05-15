import { css } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { VaultIdImage } from '../../../../components/TokenImage/TokenImage.tsx';
import { VaultClmLikeTag } from '../../../../components/VaultIdentity/components/VaultTags/VaultTags.tsx';
import { VaultPlatform } from '../../../../components/VaultPlatform/VaultPlatform.tsx';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { punctuationWrap } from '../../../../helpers/string.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { selectVaultIsBoostedForFilter } from '../../../data/selectors/filtered-vaults.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { SaveButton } from '../SaveButton/SaveButton.tsx';
import { ShareButton } from '../ShareButton/ShareButton.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type VaultHeaderProps = {
  vaultId: VaultEntity['id'];
};
export const VaultHeader = memo(function VaultHeader({ vaultId }: VaultHeaderProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const isCowcentratedLike = isCowcentratedLikeVault(vault);
  const isBoosted = useAppSelector(state => selectVaultIsBoostedForFilter(state, vaultId));

  return (
    <div className={classes.header}>
      <div className={css(styles.titleHolder, !!isCowcentratedLike && styles.titleHolderClm)}>
        <div
          className={css(
            styles.title,
            !!isCowcentratedLike && styles.titleClm,
            isBoosted && styles.titleBoost
          )}
        >
          {punctuationWrap(vault.names.list)}
        </div>
        <VaultIdImage
          vaultId={vaultId}
          size={48}
          css={!!isCowcentratedLike && styles.titleAssetClm}
        />
        {isCowcentratedLike ?
          <VaultClmLikeTag
            vault={vault}
            hideFee={isCowcentratedGovVault(vault) ? true : undefined}
          />
        : null}
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
          {vault.status === 'active' ?
            <ShareButton hideText={true} vaultId={vaultId} mobileAlternative={true} />
          : null}
        </div>
      </div>
    </div>
  );
});
