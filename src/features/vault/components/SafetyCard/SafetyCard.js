import { Box, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import LinkButton from 'components/LinkButton';
import Popover from 'components/Popover';
import { RISKS } from 'config/risk';
import SafetyScore from 'components/SafetyScore';
import Card from '../Card/Card';
import CardHeader from '../Card/CardHeader';
import CardContent from '../Card/CardContent';
import CardTitle from '../Card/CardTitle';
import styles from './styles';
import up from './up.svg';
import down from './down.svg';

const useStyles = makeStyles(styles);

const SafetyCard = ({ vaultRisks, score }) => {
  const classes = useStyles();
  const t = useTranslation().t;

  return (
    <Card>
      <CardHeader className={classes.cardHeader}>
        <CardTitle title={<SafetyScore score={score} />} subtitle={t('Safety-Score')} />
        <div className={classes.cardActions}>
          <LinkButton
            href="https://docs.beefy.finance/beefyfinance/faq/beefy-safety-score"
            text={t('Safety-HowCalc')}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className={classes.riskList}>
          {vaultRisks.map(risk => (
            <Box key={risk}>
              {RISKS[risk] && (
                <div className={classes.riskRow}>
                  <div className={classes.infoContainer}>
                    {RISKS[risk].score <= 0 ? (
                      <img alt="Positive score" src={up} className={classes.arrow} />
                    ) : (
                      <img alt="Negative score" src={down} className={classes.arrow} />
                    )}
                    <div>
                      <Typography className={classes.risk}>{t(RISKS[risk].title)}</Typography>
                      <Typography className={classes.riskCategory}>
                        {t(RISKS[risk].category)}
                      </Typography>
                    </div>
                  </div>
                  <div className={classes.moreInfoContainer}>
                    <Typography className={classes.moreInfoLabel}>{t('Safety-Meaning')}</Typography>
                    <Popover title={t(RISKS[risk].title)} content={t(RISKS[risk].explanation)} />
                  </div>
                </div>
              )}
            </Box>
          ))}
        </div>
        <div className={classes.notes}>
          <Typography>{t('Safety-HigherSafer')}</Typography>
          <Typography>{t('Safety-BeefySecure')}</Typography>
        </div>
      </CardContent>
    </Card>
  ); //return
}; //const SafetyCard

export default SafetyCard;
