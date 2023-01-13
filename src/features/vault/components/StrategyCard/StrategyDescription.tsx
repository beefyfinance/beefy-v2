import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { VaultEntity, VaultStandard } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectPlatformById } from '../../../data/selectors/platforms';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
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
  const vault = useAppSelector(state => selectVaultById(state, vaultId)) as VaultStandard;
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const vaultPlatform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const depositTokenProvider = useAppSelector(state =>
    depositToken.providerId ? selectPlatformById(state, depositToken.providerId) : null
  );
  const vaultPlatformName = vaultPlatform.name;
  const depositTokenProviderName = depositTokenProvider ? depositTokenProvider.name : null;
  const assets = vault.assetIds;
  const depositTokenName = depositToken.symbol;
  const chainName = chain.name;
  const chainNativeToken = chain.walletSettings.nativeCurrency.symbol;

  let i18nKey = `StrategyDescription-${vault.strategyTypeId}`;
  if (!i18n.exists(i18nKey)) {
    i18nKey = 'StrategyDescription-default';
  }

  const options = useMemo(() => {
    const opts = {
      vaultPlatform: vaultPlatformName,
      depositToken: depositTokenName,
      depositTokenProvider: depositTokenProviderName,
      chain: chainName,
      nativeToken: chainNativeToken,
    };

    for (const i of assets) {
      opts[`token${i}`] = assets[i];
    }

    return opts;
  }, [
    vaultPlatformName,
    assets,
    depositTokenName,
    depositTokenProviderName,
    chainName,
    chainNativeToken,
  ]);

  return (
    <>
      {vault.strategyTypeId === 'glp-gmx' ? (
        <Trans
          t={t}
          i18nKey={i18nKey}
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

const DetailsLink = memo(function () {
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
