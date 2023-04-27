import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { VaultLabelledStat } from '../VaultLabelledStat';

const useStyles = makeStyles(styles);

export type VaultValueStatProps = {
  label: string;
  tooltip?: ReactNode;
  value: ReactNode;
  subValue?: ReactNode;
  className?: string;
  blur?: boolean;
  loading: boolean;
  boosted?: boolean;
  showLabel?: boolean;
  shouldTranslate?: boolean;
  contentClassName?: string;
  triggerClassName?: string;
  labelClassName?: string;
};
export const VaultValueStat = memo<VaultValueStatProps>(function VaultValueStat({
  label,
  tooltip,
  value,
  subValue,
  blur,
  loading,
  boosted,
  showLabel = true,
  shouldTranslate = false,
  className,
  contentClassName,
  triggerClassName,
  labelClassName,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <VaultLabelledStat
      triggerClassName={clsx(classes.value, {
        [classes.blurValue]: blur,
        [triggerClassName]: triggerClassName,
        [classes.boostedValue]: boosted,
      })}
      showLabel={showLabel}
      label={t(label)}
      tooltip={loading ? null : tooltip}
      className={className}
      contentClassName={contentClassName}
      labelClassName={labelClassName}
      subValue={subValue}
      blur={blur}
      boosted={boosted}
    >
      {loading ? '...' : <>{shouldTranslate ? t(`${value}`) : value}</>}
    </VaultLabelledStat>
  );
});
