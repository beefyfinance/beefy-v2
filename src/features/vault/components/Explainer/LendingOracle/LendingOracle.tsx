import React, { memo } from 'react';
import { isGovVault, type VaultEntity } from '../../../../data/entities/vault';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../store';
import { selectVaultById } from '../../../../data/selectors/vaults';
import { selectChainById } from '../../../../data/selectors/chains';
import { explorerAddressUrl } from '../../../../../helpers/url';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

const oraclesMapToText: Record<string, string> = {
  chainlink: 'Chainlink',
  pyth: 'Pyth Network',
  curve: 'Curve',
};

export type LendingOracleProps = {
  vaultId: VaultEntity['id'];
};

export const LendingOracle = memo<LendingOracleProps>(function LendingOracle({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));

  if (isGovVault(vault) || !vault.lendingOracle) {
    return null;
  }

  return (
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
            <div className={classes.apyValue}>{oraclesMapToText[vault.lendingOracle.provider]}</div>
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
  );
});
