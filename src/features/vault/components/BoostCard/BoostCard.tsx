import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';
import { AssetsImage } from '../../../../components/AssetsImage';

const useStyles = makeStyles(styles);

export const BoostCard = ({ stratAddr, apy, network }) => {
  const classes = useStyles();
  const t = useTranslation().t;

  return (
    <Card>
      <CardHeader>
        <Typography className={classes.boostedBy}>{t('Vault-BoostedBy')}</Typography>
        <div style={{ display: 'flex' }}>
          <AssetsImage img={'single-assets/POTS.png'} />
          <div className={classes.divider} />
          <CardTitle title={'Sponsor Project'} />
        </div>
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton href={`/`} text={'Social Link'} />
          </div>
          <div className={classes.cardAction}>
            <LinkButton href={`/`} text={'Social Link'} />
          </div>
          <div className={classes.cardAction}>
            <LinkButton href={`/`} text={'Social Link'} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Typography className={classes.text}>Text Here</Typography>
      </CardContent>
    </Card>
  );
};
