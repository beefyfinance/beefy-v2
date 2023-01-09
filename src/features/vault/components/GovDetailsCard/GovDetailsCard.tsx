import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { styles } from './styles';
import { VaultGov } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';
import { LinkButton } from '../../../../components/LinkButton';
import { selectChainById } from '../../../data/selectors/chains';

const useStyles = makeStyles(styles);
export const GovDetailsCard = ({ vaultId }: { vaultId: VaultGov['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));

  return (
    <Card>
      <CardHeader className={classes.header}>
        <CardTitle title={t('Gov-Pool')} />
        <LinkButton
          href={`${chain.explorerUrl}/address/${vault.earnContractAddress}`}
          text={t('Strat-PoolAddress')}
        />
      </CardHeader>
      <CardContent>
        <p className={classes.text}>
          {vaultId === 'beefy-beFTM-earnings'
            ? t('beFTM-description')
            : vaultId === 'beefy-beJoe-earnings'
            ? t('beJOE-description')
            : vaultId === 'beefy-beqi-earnings'
            ? t('beQI-description')
            : vaultId === 'beefy-beopx-earnings'
            ? t('beOPX-description')
            : t('Gov-Info1') +
              earnedToken.symbol +
              t('Gov-Info2') +
              earnedToken.symbol +
              t('Gov-Info3')}
        </p>
      </CardContent>
    </Card>
  );
};
