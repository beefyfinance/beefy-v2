import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { useHistory, useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import image from '../../images/404image.svg';
import aprilFools from '../../images/april-fools.svg';
import { Button } from '../../components/Button';
import { Container } from '@material-ui/core';

const useStyles = makeStyles(styles);

export const PageNotFound = () => {
  const { id } = useParams<{ id: string }>();
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const handleOpen = useCallback(() => {
    history.push(`/`);
  }, [history]);

  const soylanaIds = [
    'solana-sol-broken',
    'wenona-wif-hat',
    'turnona-bonk-sol',
    'aprilfools-bome-sol',
  ];

  return (
    <Container maxWidth="lg">
      <div className={classes.inner}>
        {soylanaIds.includes(id) ? (
          <>
            <>
              <img src={aprilFools} alt="404" className={classes.image} />
              <div className={classes.textContainer}>
                <div className={classes.text}>{t('Happy April Fools 🐮')}</div>
                <Button variant="success" className={classes.button} onClick={handleOpen}>
                  {t('View-All')}
                </Button>
              </div>
            </>
          </>
        ) : (
          <>
            <img src={image} alt="404" className={classes.image} />
            <div className={classes.textContainer}>
              <div className={classes.text}>{t('Page-Not-Found')}</div>
              <Button variant="success" className={classes.button} onClick={handleOpen}>
                {t('View-All')}
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};
