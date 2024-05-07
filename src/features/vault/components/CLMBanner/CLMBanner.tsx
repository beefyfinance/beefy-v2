import { makeStyles, type Theme } from '@material-ui/core';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { getIcon } from '../../../../helpers/iconSrc';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.primary,
    padding: '16px',
    backgroundColor: theme.palette.background.contentDark,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px',
    '& img': {
      height: '24px',
    },
  },
  link: {
    color: theme.palette.text.primary,
  },
}));

export const CLMBanner = memo(function CLMBanner() {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <img src={getIcon('clm')} alt="clm" />
      <div>
        <Trans
          t={t}
          i18nKey={'CLM-Beta-Banner'}
          components={{
            LinkDocs: (
              <a
                className={classes.link}
                href={'https://docs.beefy.finance/beefy-products/clm'}
                target="_blank"
                rel="noopener"
              />
            ),
            LinkFeedback: (
              <a
                className={classes.link}
                href={'https://beefy.finance/discord'}
                target="_blank"
                rel="noopener"
              />
            ),
          }}
        />
      </div>
    </div>
  );
});
