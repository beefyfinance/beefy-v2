import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { VaultEntity, VaultStandard } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectPlatformById } from '../../../data/selectors/platforms';
import { selectTokenByAddress } from '../../../data/selectors/tokens';

export type StrategyDescriptionProps = {
  vaultId: VaultEntity['id'];
};

export const StrategyDescription = memo<StrategyDescriptionProps>(function StrategyDescription({
  vaultId,
}) {
  const { t } = useTranslation();
  // Only included when !isGovVault so we can type assert to VaultStandard
  const vault = useAppSelector(state => selectVaultById(state, vaultId)) as VaultStandard;
  const vaultPlatform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const strategyType = vault.strategyType;
  const vaultPlatformName = vaultPlatform.name;
  const assets = vault.assetIds;
  const depositTokenName = depositToken.symbol;
  const vamp = vault.name; // TODO currently there are no vaults marked 'vamp'

  const description = useMemo(() => {
    switch (strategyType) {
      case 'StratLP':
      case 'StratMultiLP':
      case 'Vamp':
        const firstPart = t('Strat-LP-First', {
          platform: vaultPlatformName,
          LPtoken: depositTokenName,
        });
        let middlePart = '';
        switch (strategyType) {
          case 'StratLP':
            middlePart = t('Strat-LP', {
              asset1: assets[0],
              asset2: assets[1],
              LPtoken: depositTokenName,
            });
            break;
          case 'StratMultiLP':
            middlePart = t('Strat-LP-Multi', { LPtoken: depositTokenName });
            break;
          case 'Vamp':
            middlePart = t('Strat-LP-Vamp', {
              subPlatform: vaultPlatformName,
              topPlatform: vamp,
              LPtoken: depositTokenName,
            });
            break;
        }
        return firstPart + ' ' + middlePart + ' ' + t('Strat-LP-GasCost');

      case 'Lending':
        return t('Strat-Lending', { asset: assets[0] });

      case 'SingleStake':
        return (
          t('Strat-Single', {
            platform: vaultPlatformName,
            token: assets[0],
          }) +
          ' ' +
          t('Strat-LP-GasCost')
        );

      case 'Maxi':
        return t('Strat-Maxi');

      default:
        return t('Strat-Default');
    }
  }, [strategyType, vaultPlatformName, assets, depositTokenName, vamp, t]);

  return <>{description}</>;
});
