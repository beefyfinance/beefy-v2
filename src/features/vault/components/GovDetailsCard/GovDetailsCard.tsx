import { makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
// import { LinkButton } from '../../../../components/LinkButton';
import { Card } from '../Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';
import { VaultGov } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles as any);
export const GovDetailsCard = ({ vaultId }: { vaultId: VaultGov['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );

  return (
    <Card>
      <CardHeader>
        <Typography className={classes.preTitle}>{t('Gov-How')}</Typography>
        <div style={{ display: 'flex' }}>
          <CardTitle title={t('Gov-Pool')} subtitle={''} />
        </div>
        {/* <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton href={`/`} text={t('Gov-Learn')} />
          </div>
        </div> */}
      </CardHeader>
      <CardContent>
        <Typography className={classes.text}>
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
        </Typography>
      </CardContent>
    </Card>
  );
};
