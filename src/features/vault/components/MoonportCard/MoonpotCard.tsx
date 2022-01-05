import React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import CakeLogo from '../../../../images/partners/moonpot/cake.svg';
import { styles } from './styles';
import { MoonpotProps } from './MoonpotProps';

const useStyles = makeStyles(styles as any);

const MoonpotCard: React.FC<MoonpotProps> = ({ name }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  function RedirectToMoonpot() {
    window.location.href = `https://play.moonpot.com/#/pot/${name}`;
  }

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img className={classes.logo} src={CakeLogo} alt="qidao" />{' '}
        <Box>
          <Typography variant="body1" className={classes.subtitle}>
            {t('Moonpot-Stake', { name: name })}
          </Typography>
          <Typography className={classes.title} variant="h3">
            {t('Moonpot-Title', { price: '$250,000' })}
          </Typography>
          <Typography variant="body1" className={classes.subtitle1}>
            {t('Moonpot-Earn')}
          </Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Box className={classes.info}>
          <Box className={classes.item}>
            <Typography variant="body2" className={classes.subtitle}>
              {t('Moonpot-NextDraw')}
            </Typography>
            <Typography className={classes.itemInfo} variant="h5">
              4d 20h 57m
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" className={classes.subtitle}>
              {t('Moonpot-Winners')}
            </Typography>
            <Typography className={classes.itemInfo} variant="h5">
              5
            </Typography>
          </Box>
        </Box>
        <Typography className={classes.content} variant="body1">
          {t('Moonpot-Content')}
        </Typography>
        <Button onClick={RedirectToMoonpot} className={classes.btn}>
          {t('Moonpot-Btn')}
        </Button>
      </CardContent>
    </Card>
  );
};

export const Moonpot = React.memo(MoonpotCard);
