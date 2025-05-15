import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { explorerAddressUrl } from '../../../../../helpers/url.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { isStandardVault, type VaultEntity } from '../../../../data/entities/vault.ts';
import { selectChainById } from '../../../../data/selectors/chains.ts';
import { selectVaultById } from '../../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

const oraclesMapToText: Record<string, string> = {
  chainlink: 'Chainlink',
  pyth: 'Pyth Network',
  curve: 'Curve',
  redstone: 'RedStone',
  dia: 'DIA',
};

export type LendingOracleProps = {
  vaultId: VaultEntity['id'];
};

export const LendingOracle = memo(function LendingOracle({ vaultId }: LendingOracleProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));

  if (!isStandardVault(vault) || !vault.lendingOracle) {
    return null;
  }

  return (
    <div>
      <div className={classes.apyTitle}>{t('Details')}</div>
      <div className={classes.apys}>
        <div>
          <div className={classes.apyLabel}>{t('Oracle')}</div>
          {vault.lendingOracle.address ?
            <a
              className={classes.oracleLink}
              target="_blank"
              href={explorerAddressUrl(chain, vault.lendingOracle.address)}
            >
              {oraclesMapToText[vault.lendingOracle.provider]}
            </a>
          : <div className={classes.apyValue}>{oraclesMapToText[vault.lendingOracle.provider]}</div>
          }
        </div>
        {vault.lendingOracle.loops && (
          <div>
            <div className={classes.apyLabel}>{t('Loops')}</div>
            <div className={classes.apyValue}>{vault.lendingOracle.loops}</div>
          </div>
        )}
      </div>
    </div>
  );
});
