import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { Box, Button, Typography } from '@material-ui/core';
import image from '../../images/404image.svg';
import { Meta } from '../../components/Meta/Meta';

const useStyles = makeStyles(styles);

export const PageNotFound = memo(function PageNotFound() {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const handleOpen = useCallback(() => {
    history.push(`/`);
  }, [history]);

  return (
    <>
      <Meta
        title={t('Meta-NotFound-Title')}
        description={t('Meta-NotFound-Description')}
        noindex={true}
      />
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
    </>
  );
});
