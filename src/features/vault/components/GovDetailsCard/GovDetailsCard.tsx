import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { styles } from './styles';
import type { VaultGov } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';
import { LinkButton } from '../../../../components/LinkButton';
import { selectChainById } from '../../../data/selectors/chains';
import { explorerAddressUrl } from '../../../../helpers/url';
import { useMemo } from 'react';

const useStyles = makeStyles(styles);
export const GovDetailsCard = ({ vaultId }: { vaultId: VaultGov['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const i18nKeys = useMemo(
    () => [`StrategyDescription-Gov-${vault.strategyTypeId}`, 'StrategyDescription-Gov-default'],
    [vault]
  );
  const i18nVars = useMemo(
    () => ({
      depositToken: depositToken.symbol,
      earnedToken: earnedToken.symbol,
      name: vault.name,
      ns: 'risks',
    }),
    [depositToken, earnedToken, vault]
  );

  return (
    <Card>
      <CardHeader className={classes.header}>
        <CardTitle title={t('Gov-Pool')} />
        <LinkButton
          href={explorerAddressUrl(chain, vault.earnContractAddress)}
          text={t('Strat-PoolAddress')}
        />
      </CardHeader>
      <CardContent>
        <p className={classes.text}>{t(i18nKeys, i18nVars)}</p>
      </CardContent>
    </Card>
  );
};
