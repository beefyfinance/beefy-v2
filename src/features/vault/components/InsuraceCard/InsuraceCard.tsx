import React from 'react';
import { Typography, makeStyles, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import InsuraceLogo from '../../../../images/partners/insurace.svg';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);

const InsuraceCard = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className={classes.header}>
        <img src={InsuraceLogo} alt="insurance" />{' '}
        <Typography className={classes.title} variant="h3">
          {t('Insurance-Title')}
        </Typography>
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {t('Insurance-Content')}
        </Typography>
        <Button className={classes.btn}>{t('Insurance-Btn')}</Button>
      </CardContent>
    </Card>
  );
};

export const Insurace = React.memo(InsuraceCard);
