import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const BoostCard = ({ boostedData }) => {
  const classes = useStyles();
  const t = useTranslation().t;

  const name = React.useMemo(() => boostedData.name, [boostedData.name]);

  const { text, social, website } = boostedData['partners'][0];

  return (
    <Card>
      <CardHeader>
        <Typography className={classes.boostedBy}>{t('Vault-BoostedBy')}</Typography>
        <div style={{ display: 'flex' }}>
          <CardTitle title={name} subtitle={''} />
        </div>
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton href={website} text={'Website'} />
          </div>
          {Object.keys(social).map(net => {
            return (
              <div key={net} className={classes.cardAction}>
                <LinkButton href={social[net]} text={net} />
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <Typography className={classes.text}>{text}</Typography>
      </CardContent>
    </Card>
  );
};
