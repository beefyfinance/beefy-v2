import { memo } from 'react';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export const LoadingStep = memo(function LoadingStep() {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <LoadingIndicator text={t('Transact-Loading')} />
    </div>
  );
});
