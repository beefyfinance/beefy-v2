import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import image from '../../images/404image.svg';
import { Button } from '../../components/Button';

const useStyles = makeStyles(styles);

export const PageNotFound = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const handleOpen = useCallback(() => {
    history.push(`/`);
  }, [history]);

  return (
    <div className={classes.pageContainer}>
      <div className={classes.imageContainer}>
        <img src={image} alt="404" className={classes.image} />
      </div>
      <div className={classes.container}>
        <div className={classes.text}>{t('Page-Not-Found')}</div>
        <Button variant="success" className={classes.button} onClick={handleOpen}>
          {t('View-All')}
        </Button>
      </div>
    </div>
  );
};
