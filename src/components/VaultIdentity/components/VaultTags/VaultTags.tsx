import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultTag, VaultTagWithTooltip } from './VaultTag';
import { useTranslation } from 'react-i18next';
import type { BoostEntity } from '../../../../features/data/entities/boost';
import { useAppSelector } from '../../../../store';
import {
  selectBoostById,
  selectPreStakeOrActiveBoostIds,
} from '../../../../features/data/selectors/boosts';
import { useIsOverflowingHorizontally } from '../../../../helpers/overflow';
import { BasicTooltipContent } from '../../../Tooltip/BasicTooltipContent';
import type { ChainEntity } from '../../../../features/data/entities/chain';
import type { TokenEntity } from '../../../../features/data/entities/token';
import { selectTokenByAddress } from '../../../../features/data/selectors/tokens';
import type { VaultEntity } from '../../../../features/data/entities/vault';
import {
  isGovVault,
  isVaultPaused,
  isVaultRetired,
} from '../../../../features/data/entities/vault';
import { VaultPlatform } from '../../../VaultPlatform';
import { selectVaultById } from '../../../../features/data/selectors/vaults';

const useStyles = makeStyles(styles);

type VaultBoostTagProps = {
  boostId: BoostEntity['id'];
};
const VaultBoostTag = memo<VaultBoostTagProps>(function VaultBoostTag({ boostId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const { isOverflowing, ref } = useIsOverflowingHorizontally();

  return (
    <VaultTagWithTooltip
      content={<BasicTooltipContent title={t('VaultTag-PartnerBoost', { partner: boost.name })} />}
      placement="bottom"
      disabled={!isOverflowing}
      className={classes.vaultTagBoost}
      ref={ref}
    >
      {'\uD83D\uDD25 '}
      {t('VaultTag-PartnerBoost', { partner: boost.name })}
    </VaultTagWithTooltip>
  );
});

type VaultEarnTagProps = {
  chainId: ChainEntity['id'];
  earnedTokenAddress: TokenEntity['address'];
};
const VaultEarnTag = memo<VaultEarnTagProps>(function VaultBoostTag({
  chainId,
  earnedTokenAddress,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, chainId, earnedTokenAddress)
  );

  return (
    <VaultTag className={classes.vaultTagEarn}>
      {t('VaultTag-EarnToken', { token: earnedToken.symbol })}
    </VaultTag>
  );
});

type VaultPlatformTagProps = {
  vaultId: VaultEntity['id'];
};
const VaultPlatformTag = memo<VaultPlatformTagProps>(function VaultPlatformTag({ vaultId }) {
  return (
    <VaultTag>
      <VaultPlatform vaultId={vaultId} />
    </VaultTag>
  );
});

export type VaultTagsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultTags = memo<VaultTagsProps>(function VaultTags({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const boostIds = useAppSelector(state => selectPreStakeOrActiveBoostIds(state, vaultId));
  const boostId = boostIds.length ? boostIds[0] : null;

  // Tag 1: Platform
  // Tag 2: Retired -> Paused -> Boosted > Earnings
  return (
    <div className={classes.vaultTags}>
      <VaultPlatformTag vaultId={vaultId} />
      {isVaultRetired(vault) ? (
        <VaultTag className={classes.vaultTagRetired}>{t('VaultTag-Retired')}</VaultTag>
      ) : isVaultPaused(vault) ? (
        <VaultTag className={classes.vaultTagPaused}>{t('VaultTag-Paused')}</VaultTag>
      ) : boostId ? (
        <VaultBoostTag boostId={boostId} />
      ) : isGovVault(vault) ? (
        <VaultEarnTag chainId={vault.chainId} earnedTokenAddress={vault.earnedTokenAddress} />
      ) : null}
    </div>
  );
});
