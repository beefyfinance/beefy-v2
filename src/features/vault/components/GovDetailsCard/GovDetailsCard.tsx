import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { styles } from './styles';
import { VaultGov } from '../../../data/entities/vault';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';

const useStyles = makeStyles(styles);
export const GovDetailsCard = ({ vaultId }: { vaultId: VaultGov['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const earnedToken = useSelector((state: BeefyState) =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );

  return (
    <Card>
      <CardHeader>
        <div className={classes.preTitle}>{t('Gov-How')}</div>
        <div>
          <CardTitle title={t('Gov-Pool')} />
        </div>
      </CardHeader>
      <CardContent>
        <p className={classes.text}>
          {vaultId === 'beefy-beFTM-earnings'
            ? t('beFTM-description')
            : vaultId === 'beefy-beJoe-earnings'
            ? t('beJOE-description')
            : vaultId === 'beefy-beqi-earnings'
            ? t('beQI-description')
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
