import { css, type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { Link } from 'react-router';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { selectChainById } from '../../features/data/selectors/chains.ts';
import { selectVaultIsBoostedForFilter } from '../../features/data/selectors/filtered-vaults.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { getNetworkSrc } from '../../helpers/networkSrc.ts';
import { punctuationWrap } from '../../helpers/string.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { VaultIcon } from './components/VaultIcon/VaultIcon.tsx';
import { VaultTags } from './components/VaultTags/VaultTags.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type VaultNameProps = {
  vaultId: VaultEntity['id'];
  isLink?: boolean;
};
export const VaultName = memo(function VaultName({ vaultId, isLink }: VaultNameProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isBoosted = useAppSelector(state => selectVaultIsBoostedForFilter(state, vaultId));

  if (isLink) {
    return (
      <Link
        to={`/vault/${vaultId}`}
        className={css(styles.vaultName, isBoosted && styles.vaultNameBoosted)}
      >
        {punctuationWrap(vault.names.list)}
      </Link>
    );
  }

  return (
    <div className={css(styles.vaultName, isBoosted && styles.vaultNameBoosted)}>
      {punctuationWrap(vault.names.list)}
    </div>
  );
});

export type VaultNetworkProps = {
  chainId: ChainEntity['id'];
  css?: CssStyles;
};
export const VaultNetwork = memo(function VaultNetwork({
  chainId,
  css: cssProp,
}: VaultNetworkProps) {
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <div
      className={css(
        { colorPalette: `network.${chainId}` },
        styles.vaultNetwork,
        chain?.brand?.icon === 'gradient' && styles.vaultNetworkGradient,
        cssProp
      )}
    >
      <img alt={chain.name} src={getNetworkSrc(chainId)} width={24} height={24} />
    </div>
  );
});

export type VaultIdentityProps = {
  vaultId: VaultEntity['id'];
  networkCss?: CssStyles;
  isLink?: boolean;
};
export const VaultIdentity = memo(function VaultIdentity({
  vaultId,
  networkCss,
  isLink,
}: VaultIdentityProps) {
  const classes = useStyles();

  return (
    <div className={classes.vaultIdentity}>
      <VaultIdentityContent isLink={isLink} vaultId={vaultId} networkCss={networkCss} />
    </div>
  );
});

export const VaultIdentityContent = memo(function VaultIdentityContent({
  vaultId,
  networkCss,
  isLink,
}: VaultIdentityProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <>
      <VaultNetwork css={networkCss} chainId={vault.chainId} />
      <VaultIcon vaultId={vaultId} />
      <div className={classes.vaultNameTags}>
        <VaultName isLink={isLink} vaultId={vaultId} />
        <VaultTags vaultId={vaultId} />
      </div>
    </>
  );
});
