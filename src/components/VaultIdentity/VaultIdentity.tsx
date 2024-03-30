import React, { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault';
import { useAppSelector } from '../../store';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsVaultPreStakedOrBoosted } from '../../features/data/selectors/boosts';
import clsx from 'clsx';
import type { ChainEntity } from '../../features/data/entities/chain';
import { selectChainById } from '../../features/data/selectors/chains';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultIcon } from './components/VaultIcon';
import { VaultTags } from './components/VaultTags';
import { Link } from 'react-router-dom';
import { punctuationWrap } from '../../helpers/string';
import { getNetworkSrc } from '../../helpers/networkSrc';

const useStyles = makeStyles(styles);

export type VaultNameProps = {
  vaultId: VaultEntity['id'];
  isLink?: boolean;
};
export const VaultName = memo<VaultNameProps>(function VaultName({ vaultId, isLink }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isBoosted = useAppSelector(state => selectIsVaultPreStakedOrBoosted(state, vaultId));

  if (isLink) {
    return (
      <Link
        to={`/vault/${vaultId}`}
        className={clsx({
          [classes.vaultName]: true,
          [classes.vaultNameBoosted]: isBoosted,
        })}
      >
        {punctuationWrap(vault.id === 'bifi-vault' ? `${vault.name} Vault` : vault.name)}
      </Link>
    );
  }

  return (
    <div
      className={clsx({
        [classes.vaultName]: true,
        [classes.vaultNameBoosted]: isBoosted,
      })}
    >
      {punctuationWrap(vault.id === 'bifi-vault' ? `${vault.name} Vault` : vault.name)}
    </div>
  );
});

export type VaultNetworkProps = {
  chainId: ChainEntity['id'];
  className?: string;
};
export const VaultNetwork = memo<VaultNetworkProps>(function VaultNetwork({ chainId, className }) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <div className={clsx(classes.vaultNetwork, className, classes[`vaultNetwork-${chainId}`])}>
      <img alt={chain.name} src={getNetworkSrc(chainId)} width={24} height={24} />
    </div>
  );
});

export type VaultIdentityProps = {
  vaultId: VaultEntity['id'];
  networkClassName?: string;
  isLink?: boolean;
};
export const VaultIdentity = memo<VaultIdentityProps>(function VaultIdentity({
  vaultId,
  networkClassName,
  isLink,
}) {
  const classes = useStyles();

  return (
    <div className={classes.vaultIdentity}>
      <VaultIdentityContent isLink={isLink} vaultId={vaultId} networkClassName={networkClassName} />
    </div>
  );
});

export const VaultIdentityContent = memo<VaultIdentityProps>(function VaultIdentityContent({
  vaultId,
  networkClassName,
  isLink,
}) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <>
      <VaultNetwork className={networkClassName} chainId={vault.chainId} />
      <VaultIcon vaultId={vaultId} />
      <div className={classes.vaultNameTags}>
        <VaultName isLink={isLink} vaultId={vaultId} />
        <VaultTags vaultId={vaultId} />
      </div>
    </>
  );
});
