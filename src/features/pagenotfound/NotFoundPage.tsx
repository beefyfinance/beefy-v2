import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles.ts';
import { useHistory } from 'react-router-dom';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import image from '../../images/404image.svg';
import { Button } from '../../components/Button/Button.tsx';
import { Container } from '../../components/Container/Container.tsx';

const useStyles = legacyMakeStyles(styles);

const NotFoundPage = memo(() => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const handleOpen = useCallback(() => {
    history.push(`/`);
  }, [history]);

  return (
    <Container maxWidth="lg">
      <div className={classes.inner}>
        <img src={image} alt="404" className={classes.image} />
        <div className={classes.textContainer}>
          <div className={classes.text}>{t('Page-Not-Found')}</div>
          <Button variant="success" css={styles.button} onClick={handleOpen}>
            {t('View-All')}
          </Button>
        </div>
      </div>
    </Container>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default NotFoundPage;
