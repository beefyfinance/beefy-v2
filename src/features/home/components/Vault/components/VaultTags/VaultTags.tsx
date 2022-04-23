import React, { memo } from 'react';
import { BoostEntity } from '../../../../../data/entities/boost';
import { useAppSelector } from '../../../../../../store';
import {
  selectBoostById,
  selectPreStakeOrActiveBoostIds,
} from '../../../../../data/selectors/boosts';
import {
  isGovVault,
  isVaultPaused,
  isVaultRetired,
  VaultEntity,
} from '../../../../../data/entities/vault';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultTag } from './VaultTag';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export type VaultBoostTagProps = {
  boostId: BoostEntity['id'];
};
export const VaultBoostTag = memo<VaultBoostTagProps>(function VaultBoostTag({ boostId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, boostId));

  return (
    <VaultTag className={classes.vaultTagBoost}>
      {t('Vault-BoostedByPartner', { partner: boost.name })}
    </VaultTag>
  );
});

export type VaultTagsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultTags = memo<VaultTagsProps>(function VaultTags({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const boostIds = useAppSelector(state => selectPreStakeOrActiveBoostIds(state, vaultId));
  const boostId = boostIds.length ? boostIds[0] : null;

  // Tag 1: Platform
  // Tag 2: Retired -> Paused -> Boosted > Earnings
  return (
    <div className={classes.vaultTags}>
      <VaultTag>{vault.tokenDescription}</VaultTag>
      {isVaultRetired(vault) ? (
        <VaultTag className={classes.vaultTagRetired}>Retired Vault</VaultTag>
      ) : isVaultPaused(vault) ? (
        <VaultTag className={classes.vaultTagPaused}>Paused Vault</VaultTag>
      ) : boostId ? (
        <VaultBoostTag boostId={boostId} />
      ) : isGovVault(vault) ? (
        <VaultTag className={classes.vaultTagEarn}>Earn {vault.earnedTokenId}</VaultTag>
      ) : null}
    </div>
  );
});
