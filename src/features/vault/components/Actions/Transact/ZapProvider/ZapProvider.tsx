import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ProviderIcon } from '../ProviderIcon';

const useStyles = makeStyles(styles);

export type ZapProviderProps = {
  providerId: string;
  className?: string;
};
export const ZapProvider = memo<ZapProviderProps>(function ({ providerId, className }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={clsx(classes.container, className)}>
      <ProviderIcon provider={providerId} width={24} className={classes.icon} />
      {t(`Transact-Provider-${providerId}`)}
    </div>
  );
});
