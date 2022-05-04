import React from 'react';
import { Typography, makeStyles, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import QiDaoLogo from '../../../../images/partners/qidao.svg';
import { styles } from './styles';
import { VaultEntity } from '../../../data/entities/vault';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';

const useStyles = makeStyles(styles as any);

const QiDaoCard = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const earnedToken = useSelector((state: BeefyState) =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img src={QiDaoLogo} alt="qidao" />{' '}
        <Typography className={classes.title} variant="h3">
          {t('QiDao-Title')}
        </Typography>
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {t('QiDao-Content')}
        </Typography>
        <a
          className={classes.link}
          target="_blank"
          rel="noreferrer"
          href="https://app.mai.finance/vaults"
        >
          <Button className={classes.btn}>
            {t('QiDao-Btn', { mooToken: earnedToken.symbol })}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};

export const QiDao = React.memo(QiDaoCard);
