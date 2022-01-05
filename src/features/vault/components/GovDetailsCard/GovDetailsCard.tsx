import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton';
import { Card } from '../Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const GovDetailsCard = (earnedToken) => {
  const classes = useStyles();
  const t = useTranslation().t;

  return (
    <Card>
      <CardHeader>
        <Typography className={classes.preTitle}>{t('Gov-How')}</Typography>
        <div style={{ display: 'flex' }}>
          <CardTitle title={t('Gov-Pool')} subtitle={''} />
        </div>
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton href={`/`} text={t('Gov-Learn')} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Typography className={classes.text}>{t('Gov-Info1') + earnedToken.earnedToken + t('Gov-Info2') + earnedToken.earnedToken + t('Gov-Info3')}</Typography>
      </CardContent>
    </Card>
  );
};
