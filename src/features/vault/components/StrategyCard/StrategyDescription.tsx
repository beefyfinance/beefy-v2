import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  isCowcentratedLiquidityVault,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultStandard,
} from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectPlatformById } from '../../../data/selectors/platforms';
import { selectTokenByAddress, selectVaultTokenSymbols } from '../../../data/selectors/tokens';
import { selectChainById } from '../../../data/selectors/chains';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';

export type StrategyDescriptionProps = {
  vaultId: VaultEntity['id'];
};

const useStyles = makeStyles(styles);

export const StrategyDescription = memo<StrategyDescriptionProps>(function StrategyDescription({
  vaultId,
}) {
  const { t, i18n } = useTranslation();
  // Only included when !isGovVault so we can type assert to VaultStandard
  const vault = useAppSelector(state => selectVaultById(state, vaultId)) as
    | VaultStandard
    | VaultCowcentrated;
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const vaultPlatform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const depositTokenProvider = useAppSelector(state =>
    depositToken.providerId ? selectPlatformById(state, depositToken.providerId) : null
  );

  const vaultTokenSymbols = useAppSelector(state => selectVaultTokenSymbols(state, vault.id));
  const vaultPlatformName = vaultPlatform.name;
  const depositTokenProviderName = depositTokenProvider ? depositTokenProvider.name : null;

  const depositTokenName = depositToken.symbol;
  const chainName = chain.name;
  const chainNativeToken = chain.walletSettings.nativeCurrency.symbol;

  const depositToken0 = isCowcentratedLiquidityVault(vault) ? vault.assetIds[0] : null;
  const depositToken1 = isCowcentratedLiquidityVault(vault) ? vault.assetIds[1] : null;

  let i18nKey = `StrategyDescription-${vault.strategyTypeId}`;

  if (!i18n.exists(i18nKey, { ns: 'risks' })) {
    i18nKey = 'StrategyDescription-default';
  }

  const options = useMemo(() => {
    const opts = {
      vaultPlatform: vaultPlatformName,
      depositToken: depositTokenName,
      depositTokenProvider: depositTokenProviderName,
      chain: chainName,
      nativeToken: chainNativeToken,
      depositToken0,
      depositToken1,
      ns: 'risks',
    };

    for (const i in vaultTokenSymbols) {
      opts[`asset${i}`] = vaultTokenSymbols[i];
    }

    return opts;
  }, [
    vaultPlatformName,
    vaultTokenSymbols,
    depositTokenName,
    depositTokenProviderName,
    chainName,
    chainNativeToken,
    depositToken0,
    depositToken1,
  ]);

  return (
    <>
      {vault.strategyTypeId === 'glp-gmx' ? (
        <Trans
          t={t}
          i18nKey={i18nKey}
          ns="risks"
          values={options}
          components={{
            details: <DetailsLink />,
          }}
        />
      ) : (
        t(i18nKey, options)
      )}
    </>
  );
});

const DetailsLink = memo(function DetailsLink() {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <a
      className={classes.detailsLink}
      target="__blank"
      rel="noopener"
      href={'https://beefy.com/articles/earn-glp-with-beefy-s-new-glp-strategy-and-vaults/'}
    >
      {t('Details-Here')}
    </a>
  );
});
