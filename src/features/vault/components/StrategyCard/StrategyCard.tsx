import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formattedTotalApy } from '../../../../helpers/format';
import { LinkButton } from '../../../../components/LinkButton';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { styles } from './styles';
import { StrategyDescription } from './StrategyDescription';
import { selectVaultTotalApy } from '../../../data/selectors/apy';
import type { VaultEntity } from '../../../data/entities/vault';
import { isGovVault, shouldVaultShowInterest } from '../../../data/entities/vault';
import { selectVaultById, selectVaultStrategyAddress } from '../../../data/selectors/vaults';
import { selectChainById } from '../../../data/selectors/chains';
import { selectIsVaultBoosted } from '../../../data/selectors/boosts';
import { StatLoader } from '../../../../components/StatLoader';
import { useAppSelector } from '../../../../store';
import { explorerAddressUrl } from '../../../../helpers/url';

const useStyles = makeStyles(styles);

function StrategyCardComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const values = useAppSelector(state => selectVaultTotalApy(state, vaultId));
  const formatted = formattedTotalApy(values, <StatLoader />);
  const stratAddr = useAppSelector(state => selectVaultStrategyAddress(state, vaultId));
  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));
  const showApy = shouldVaultShowInterest(vault);

  if (isGovVault(vault)) {
    return <></>;
  }

  return (
    <Card>
      <CardHeader className={classes.header}>
        <div>
          <CardTitle title={t('Vault-Strategy')} />
        </div>
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton href={explorerAddressUrl(chain, stratAddr)} text={t('Strat-Address')} />
          </div>
          <div className={classes.cardAction}>
            <LinkButton
              href={explorerAddressUrl(chain, vault.earnContractAddress)}
              text={t('Strat-AddressVault')}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={classes.text}>
          <StrategyDescription vaultId={vaultId} />
        </div>
        <div className={classes.infoContainer}>
          {showApy ? (
            <div className={classes.apysContainer}>
              <div className={classes.apyTitle}>{t('Vault-ApyBreakdown')}</div>
              <div className={classes.apys}>
                <div className={classes.apy}>
                  <div className={classes.apyLabel}>{t('Vault-ApyTotal')}</div>
                  <div className={classes.apyValue}>
                    {isBoosted ? formatted.boostedTotalApy : formatted.totalApy}
                  </div>
                </div>
                {values.vaultApr && (
                  <div className={classes.apy}>
                    <div className={classes.apyLabel}>{t('Vault-VaultApr')}</div>
                    <div className={classes.apyValue}>{formatted.vaultApr}</div>
                  </div>
                )}
                {(values.tradingApr ?? 0) > 0 && (
                  <div className={classes.apy}>
                    <div className={classes.apyLabel}>{t('Vault-AprTrading')}</div>
                    <div className={classes.apyValue}>{formatted.tradingApr}</div>
                  </div>
                )}
                {(values.liquidStakingApr ?? 0) > 0 && (
                  <div className={classes.apy}>
                    <div className={classes.apyLabel}>{t('Vault-AprLiquidStaking')}</div>
                    <div className={classes.apyValue}>{formatted.liquidStakingApr}</div>
                  </div>
                )}
                {(values.composablePoolApr ?? 0) > 0 && (
                  <div className={classes.apy}>
                    <div className={classes.apyLabel}>{t('Vault-AprComposablePool')}</div>
                    <div className={classes.apyValue}>{formatted.composablePoolApr}</div>
                  </div>
                )}
                {isBoosted && (
                  <div className={classes.apy}>
                    <div className={classes.apyLabel}>{t('Vault-AprBoost')}</div>
                    <div className={classes.apyValue}>{formatted.boostApr}</div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          <LendingOracle vaultId={vault.id} />
        </div>
      </CardContent>
    </Card>
  );
}

const oraclesMapToText: Record<string, string> = {
  chainlink: 'Chainlink',
  pyth: 'Pyth Network',
  curve: 'Curve',
};

export const LendingOracle = memo(function LendingOracle({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  return (
    !isGovVault(vault) &&
    vault.lendingOracle && (
      <div>
        <div className={classes.apyTitle}>{t('Details')}</div>
        <div className={classes.apys}>
          <div className={classes.apy}>
            <div className={classes.apyLabel}>{t('Oracle')}</div>
            {vault.lendingOracle.address ? (
              <a
                className={classes.oracleLink}
                target="_blank"
                rel="noopener noreferrer"
                href={explorerAddressUrl(chain, vault.lendingOracle.address)}
              >
                {oraclesMapToText[vault.lendingOracle.provider]}
              </a>
            ) : (
              <div className={classes.apyValue}>
                {oraclesMapToText[vault.lendingOracle.provider]}
              </div>
            )}
          </div>
          {vault.lendingOracle.loops && (
            <div className={classes.apy}>
              <div className={classes.apyLabel}>{t('Loops')}</div>
              <div className={classes.apyValue}>{vault.lendingOracle.loops}</div>
            </div>
          )}
        </div>
      </div>
    )
  );
});

export const StrategyCard = memo(StrategyCardComponent);
