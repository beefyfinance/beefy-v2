import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { Button, Typography, Box } from '@material-ui/core';
import image from '../../images/404image.svg';

const useStyles = makeStyles(styles as any);

export const PageNotFound = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const handleOpen = useCallback(() => {
    history.push(`/`);
  }, [history]);

  return (
    <Box className={classes.pageContainer}>
      <Box className={classes.imageContainer}>
        <img src={image} alt="404" className={classes.image} />
      </Box>
      <Box className={classes.container}>
        <Typography className={classes.text}>{t('Page-Not-Found')}</Typography>
        <Button className={classes.button} onClick={handleOpen}>
          {t('View-All')}
        </Button>
      </Box>
    </Box>
  );
};
