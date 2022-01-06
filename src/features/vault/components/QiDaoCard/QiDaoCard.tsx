import React from 'react';
import { Typography, makeStyles, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import QiDaoLogo from '../../../../images/partners/qidao.svg';
import { styles } from './styles';
import { QiDaoProps } from './QiDaoProps';

const useStyles = makeStyles(styles as any);

const QiDaoCard: React.FC<QiDaoProps> = ({ mooToken }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  function RedirectToQidao() {
    window.location.href = 'https://app.mai.finance/vaults';
  }

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
        <Button onClick={RedirectToQidao} className={classes.btn}>
          {t('QiDao-Btn', { mooToken: mooToken })}
        </Button>
      </CardContent>
    </Card>
  );
};

export const QiDao = React.memo(QiDaoCard);
