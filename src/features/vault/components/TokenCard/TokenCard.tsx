import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { LinkButton } from '../../../../components/LinkButton';
import { config } from '../../../../config/config';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const TokenCard = ({ token, network }) => {
  const classes = useStyles();
  const t = useTranslation().t;

  const { symbol, website, address, description } = token;

  return (
    <Card>
      <CardHeader>
        <Typography className={classes.detailTitle}>{t('Token-Detail')}</Typography>
        <CardTitle title={symbol} />
        <div className={classes.cardActions}>
          {website ? (
            <div className={classes.cardAction}>
              <LinkButton href={website} text={t('Token-Site')} />
            </div>
          ) : null}
          <div className={classes.cardAction}>
            <LinkButton
              href={`${config[network].explorerUrl}/token/${address}`}
              className={classes.cardAction}
              text={t('Token-Contract')}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Typography className={classes.text}>
          {description ? description : t('Token-NoDescrip')}
        </Typography>
      </CardContent>
    </Card>
  );
};