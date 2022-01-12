import React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import LaCucinaLogo from '../../../../images/partners/lacucina.svg';
import LaCucinaToken from '../../../../images/partners/lacucinatoken.svg';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);

const LaCucinaCard: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img className={classes.logo} src={LaCucinaLogo} alt="lacucina" />{' '}
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {t('LaCucina-Content')}
        </Typography>
        <Box className={classes.info}>
          <Box className={classes.item}>
            <Typography variant="body2" className={classes.subtitle}>
              {t('LaCucina-Apr')}
            </Typography>
            <Typography className={classes.itemInfo} variant="h5">
              475%
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" className={classes.subtitle}>
              {t('LaCucina-Ends')}
            </Typography>
            <Typography className={classes.itemInfo} variant="h5">
              4d 20h 57m
            </Typography>
          </Box>
        </Box>
        <Box className={classes.info2}>
          <Typography variant="body2" className={classes.subtitle}>
            {t('LaCucina-Earn')}
          </Typography>
          <Typography className={classes.itemInfo} variant="h5">
            <img src={LaCucinaToken} className={classes.token} alt="LaCucinaToken" /> LAC
          </Typography>
        </Box>

        <Button className={classes.btn}>{t('LaCucina-Btn')}</Button>
      </CardContent>
    </Card>
  );
};

export const LaCucina = React.memo(LaCucinaCard);
