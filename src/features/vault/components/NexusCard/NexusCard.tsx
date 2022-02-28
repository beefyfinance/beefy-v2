import React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import NexusLogo from '../../../../images/partners/nexus.svg';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);

const NexusCard = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img src={NexusLogo} alt="nexus" />{' '}
        <Box>
          <Typography className={classes.subtitle} variant="body1">
            {t('Nexus-SubTitle')}
          </Typography>
          <Typography className={classes.title} variant="h3">
            {t('Nexus-Title')}
          </Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {t('Nexus-Content')}
        </Typography>
        <a className={classes.link} target="_blank" rel="noreferrer" href="">
          <Button className={classes.btn}>{t('Nexus-Btn')}</Button>
        </a>
      </CardContent>
    </Card>
  );
};

export const Nexus = React.memo(NexusCard);
