import React from 'react';
import { Typography, makeStyles, Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { styles } from './styles';
import { MoonpotProps } from './MoonpotProps';

const useStyles = makeStyles(styles as any);

const MoonpotCard: React.FC<MoonpotProps> = ({ name, item }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className={classes.header}>
        <img
          className={classes.logo}
          src={require(`../../../../images/${item.img}`).default}
          alt={name}
        />{' '}
        <Box>
          <Typography variant="body1" className={classes.subtitle}>
            {t('Moonpot-Stake', { name: name })}
          </Typography>
          <Typography className={classes.title} variant="h3">
            {t('Moonpot-Title', { name: name })}
          </Typography>
        </Box>
      </CardHeader>
      <CardContent>
        <Typography className={classes.content} variant="body1">
          {t('Moonpot-Content')}
        </Typography>
        <a className={classes.link} target="_blank" rel="noreferrer" href={item.link}>
          <Button className={classes.btn}>{t('Moonpot-Btn')}</Button>
        </a>
      </CardContent>
    </Card>
  );
};

export const Moonpot = React.memo(MoonpotCard);
