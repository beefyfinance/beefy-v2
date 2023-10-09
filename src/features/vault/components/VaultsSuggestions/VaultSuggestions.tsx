import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { useAppSelector } from '../../../../store';
import type { BeefyState } from '../../../../redux-types';
import { intersection, orderBy } from 'lodash-es';
import { RetirePauseReason } from '../RetirePauseReason';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { selectChainById } from '../../../data/selectors/chains';
import { getNetworkSrc } from '../../../../helpers/networkSrc';
import { VaultIcon } from '../../../../components/VaultIdentity/components/VaultIcon';
import { VaultName } from '../../../../components/VaultIdentity';
import { VaultPlatformTag } from '../../../../components/VaultIdentity/components/VaultTags';
import { VaultTag } from '../../../../components/VaultIdentity/components/VaultTags/VaultTag';
import { VaultYearlyStat } from '../../../../components/VaultStats/VaultYearlyStat';
import { VaultTvlStat } from '../../../../components/VaultStats/VaultTvlStat';
import { selectVaultTvl } from '../../../data/selectors/tvl';
import { toNumberUnsafe } from '../../../../helpers/big-number';
import { selectIsVaultBoosted } from '../../../data/selectors/boosts';

const useStyles = makeStyles(styles);

function selectVaultSuggestions(state: BeefyState, forVaultId: VaultEntity['id']) {
  const forVault = selectVaultById(state, forVaultId);
  const scoredVaults = orderBy(
    state.entities.vaults.allIds
      .map(vaultId => selectVaultById(state, vaultId))
      .filter(vault => vault.status === 'active')
      .map(vault => {
        const sameChain = vault.chainId === forVault.chainId ? 1 : 0;
        const sameDepositToken =
          sameChain && vault.depositTokenAddress === forVault.depositTokenAddress;
        const sameAssets = intersection(vault.assetIds, forVault.assetIds).length;
        const isBoosted = selectIsVaultBoosted(state, vault.id);
        const score =
          (sameDepositToken ? 10 : 0) +
          sameChain +
          sameAssets * 2 +
          (isBoosted ? 1 + sameChain : 0);
        return {
          vaultId: vault.id,
          score,
          tvl: toNumberUnsafe(selectVaultTvl(state, vault.id)),
        };
      }),
    ['score', 'tvl'],
    ['desc', 'desc']
  );

  return scoredVaults.slice(0, 4).map(({ vaultId }) => vaultId);
}

export type VaultSuggestionProps = { vaultId: VaultEntity['id'] };

export const VaultSuggestion = memo<VaultSuggestionProps>(function VaultSuggestion({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));

  return (
    <Link
      className={clsx(classes.suggestion, classes[`suggestion-${vault.chainId}`])}
      to={`/vault/${vaultId}`}
    >
      <div className={classes.vaultIdentity}>
        <VaultIcon vaultId={vaultId} />
        <VaultName isLink={false} vaultId={vaultId} className={classes.vaultName} />
      </div>
      <div className={classes.vaultStats}>
        <div className={classes.vaultStatApy}>
          <VaultYearlyStat vaultId={vaultId} />
        </div>
        <VaultTvlStat vaultId={vaultId} />
      </div>
      <div className={classes.vaultTags}>
        <VaultTag className={classes.vaultTagNetwork}>
          <img
            alt={chain.name}
            src={getNetworkSrc(vault.chainId)}
            width={16}
            height={16}
            className={classes.vaultNetworkIcon}
          />
          <div className={classes.vaultNetworkName}>{chain.name}</div>
        </VaultTag>
        <VaultPlatformTag vaultId={vaultId} />
      </div>
    </Link>
  );
});

export type VaultSuggestionsProps = { vaultId: VaultEntity['id'] };

export const VaultSuggestions = memo<VaultSuggestionsProps>(function VaultSuggestions({ vaultId }) {
  const classes = useStyles();
  const suggestions = useAppSelector(state => selectVaultSuggestions(state, vaultId));

  return (
    <div className={classes.container}>
      <RetirePauseReason vaultId={vaultId} />
      {suggestions.length ? (
        <div className={classes.suggestions}>
          {suggestions.map(id => (
            <VaultSuggestion vaultId={id} key={id} />
          ))}
        </div>
      ) : null}
    </div>
  );
});
