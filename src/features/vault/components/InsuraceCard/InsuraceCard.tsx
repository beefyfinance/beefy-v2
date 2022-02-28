import React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import InsuraceLogo from '../../../../images/partners/insurace.svg';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);

const InsuraceCard = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img src={InsuraceLogo} alt="insurance" />{' '}
        <Box>
          <Typography className={classes.subtitle} variant="body1">
            {t('Insurance-SubTitle')}
          </Typography>
          <Typography className={classes.title} variant="h3">
            {t('Insurance-Title')}
          </Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {t('Insurance-Content')}
        </Typography>
        <a
          className={classes.link}
          target="_blank"
          rel="noreferrer"
          href="https://app.insurace.io/Insurance/Cart?id=110&chain=BSC&referrer=95244279533280151623141934507761661103282646845"
        >
          <Button className={classes.btn}>{t('Insurance-Btn')}</Button>
        </a>
      </CardContent>
    </Card>
  );
};

export const Insurace = React.memo(InsuraceCard);
