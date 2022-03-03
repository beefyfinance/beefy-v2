import React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import LaCucinaLogo from '../../../../images/partners/lacucina.svg';
import LaCucinaToken from '../../../../images/partners/lacucinatoken.svg';
import { styles } from './styles';
import { useLaCucina } from './useLaCucina';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectLacucinaData } from '../../../data/selectors/partners';
import { StakeCountdown } from '../BoostWidget/StakeCountdown';

const useStyles = makeStyles(styles as any);

const LaCucinaCard = ({ vaultId }: { vaultId: string }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { ovenId, url } = useSelector((state: BeefyState) => selectLacucinaData(state, vaultId));

  const [data] = useLaCucina(ovenId);
  return (
    <Card>
      {console.log(data)}
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
              {data.aprValue}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" className={classes.subtitle}>
              {t('LaCucina-Ends')}
            </Typography>
            <Typography className={classes.itemInfo} variant="h5">
              <StakeCountdown periodFinish={data.expiryDate} />
            </Typography>
          </Box>
        </Box>
        <Box className={classes.info2}>
          <Typography variant="body2" className={classes.subtitle}>
            {t('LaCucina-Earn')}
          </Typography>
          <Typography className={classes.itemInfo} variant="h5">
            <img src={LaCucinaToken} className={classes.token} alt="LaCucinaToken" />{' '}
            {data.rewardTokenSymbol}
          </Typography>
        </Box>
        <a className={classes.link} target="_blank" rel="noreferrer" href={url}>
          <Button className={classes.btn}>{t('LaCucina-Btn')}</Button>
        </a>
      </CardContent>
    </Card>
  );
};

export const LaCucina = React.memo(LaCucinaCard);
