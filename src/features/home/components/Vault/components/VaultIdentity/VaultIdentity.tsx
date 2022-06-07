import React, { memo } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectIsVaultPreStakedOrBoosted } from '../../../../../data/selectors/boosts';
import clsx from 'clsx';
import { ChainEntity } from '../../../../../data/entities/chain';
import { selectChainById } from '../../../../../data/selectors/chains';
import { VaultIcon } from '../VaultIcon';
import { VaultTags } from '../VaultTags';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type VaultNameProps = {
  vaultId: VaultEntity['id'];
};
export const VaultName = memo<VaultNameProps>(function VaultName({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isBoosted =
    useAppSelector(state => selectIsVaultPreStakedOrBoosted(state, vaultId)) &&
    vault.platformId !== 'valleyswap';

  return (
    <div
      className={clsx({
        [classes.vaultName]: true,
        [classes.vaultNameBoosted]: isBoosted,
      })}
    >
      {vault.name}
    </div>
  );
});

export type VaultNetworkProps = {
  chainId: ChainEntity['id'];
};
export const VaultNetwork = memo<VaultNetworkProps>(function VaultNetwork({ chainId }) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <div className={clsx(classes.vaultNetwork, classes[`vaultNetwork-${chainId}`])}>
      <img
        alt={chain.name}
        src={require(`../../../../../../images/networks/${chainId}.svg`).default}
        width={24}
        height={24}
      />
    </div>
  );
});

export type VaultIdentityProps = {
  vaultId: VaultEntity['id'];
};
export const VaultIdentity = memo<VaultIdentityProps>(function VaultIdentity({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <div className={classes.vaultIdentity}>
      <VaultNetwork chainId={vault.chainId} />
      <VaultIcon vaultId={vaultId} />
      <div className={classes.vaultNameTags}>
        <VaultName vaultId={vaultId} />
        <VaultTags vaultId={vaultId} />
      </div>
    </div>
  );
});
