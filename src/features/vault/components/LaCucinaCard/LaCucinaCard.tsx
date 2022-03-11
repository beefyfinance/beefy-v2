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
import ContentLoader from 'react-content-loader';

const useStyles = makeStyles(styles as any);

const _ContentLoading = ({ backgroundColor = '#313759', foregroundColor = '#8585A6' }) => {
  return (
    <ContentLoader
      width={64}
      height={16}
      viewBox="0 0 64 16"
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect x="0" y="0" width="64" height="16" />
    </ContentLoader>
  );
};
const ContentLoading = React.memo(_ContentLoading);

const LaCucinaCard = ({ vaultId }: { vaultId: string }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const { ovenId } = useSelector((state: BeefyState) => selectLacucinaData(state, vaultId));

  const [data] = useLaCucina(ovenId, setIsLoading);
  return (
    <Card>
      <CardHeader className={classes.header}>
        <img className={classes.logo} src={LaCucinaLogo} alt="lacucina" />{' '}
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {t('LaCucina-Content')}
        </Typography>
        <Typography className={classes.content1} variant="body1">
          {t('LaCucina-Content1')}
        </Typography>
        <Box className={classes.info}>
          <Box className={classes.item}>
            <Typography variant="body2" className={classes.subtitle}>
              {t('LaCucina-Apr')}
            </Typography>
            <Typography className={classes.itemInfo} variant="h5">
              {isLoading ? <ContentLoading /> : data.aprValue}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" className={classes.subtitle}>
              {t('LaCucina-Ends')}
            </Typography>
            <Typography className={classes.itemInfo} variant="h5">
              {isLoading ? <ContentLoading /> : <StakeCountdown periodFinish={data.expiryDate} />}
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
        <a
          className={classes.link}
          target="_blank"
          rel="noreferrer"
          href={`https://app.lacucina.io/oven-details/${ovenId}?isFeatured=false&isStaked=false`}
        >
          <Button className={classes.btn}>{t('LaCucina-Btn')}</Button>
        </a>
      </CardContent>
    </Card>
  );
};

export const LaCucina = React.memo(LaCucinaCard);
