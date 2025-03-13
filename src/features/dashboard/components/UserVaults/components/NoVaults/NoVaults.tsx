import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles({
  container: css.raw({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '4px',
    padding: '24px',
    background: 'background.content',
    borderRadius: '0px 0px 8px 8px',
    marginTop: '2px',
  }),
  title: css.raw({
    textStyle: 'h3',
    color: 'text.middle',
  }),
  text: css.raw({
    textStyle: 'body',
    color: 'text.middle',
  }),
});

export const NoVaults = memo(function NoVaults() {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.container}>
      <div className={classes.title}>{t('NoResults-NoResultsFound')}</div>
      <div className={classes.text}>{t('NoResults-TryClearSearch')}</div>
    </div>
  );
});
