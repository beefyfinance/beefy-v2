import React from 'react';
import { config } from 'config/config';
import { makeStyles, Typography } from '@material-ui/core';
import styles from './styles';
import LinkButton from 'components/LinkButton';
import Card from '../Card/Card';
import CardHeader from '../Card/CardHeader';
import CardContent from '../Card/CardContent';
import CardTitle from '../Card/CardTitle/CardTitle';

const useStyles = makeStyles(styles);

const TokenCard = ({ token, network }) => {
  const classes = useStyles();

  const { symbol, website, address, description } = token;

  return (
    <Card>
      <CardHeader>
        <CardTitle title={symbol} subtitle="Asset details" />
        <div className={classes.cardActions}>
          {website ? (
            <div className={classes.cardAction}>
              <LinkButton href={website} text="Website" />
            </div>
          ) : null}
          <div className={classes.cardAction}>
            <LinkButton
              href={`${config[network].explorerUrl}/token/${address}`}
              className={classes.cardAction}
              text="Token Contract"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Typography className={classes.text}>
          {description ? description : 'No token description available.'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TokenCard;
