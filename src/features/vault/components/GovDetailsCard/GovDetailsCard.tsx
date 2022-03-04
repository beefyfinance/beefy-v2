import { makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
// import { LinkButton } from '../../../../components/LinkButton';
import { Card } from '../Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';
import { VaultGov } from '../../../data/entities/vault';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenById } from '../../../data/selectors/tokens';

const useStyles = makeStyles(styles as any);
export const GovDetailsCard = ({ vaultId }: { vaultId: VaultGov['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const earnedToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, vault.earnedTokenId)
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
