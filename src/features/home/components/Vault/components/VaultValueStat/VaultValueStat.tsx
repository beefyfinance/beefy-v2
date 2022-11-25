import React, { memo, ReactNode } from 'react';
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
  isValueString?: boolean;
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
  isValueString = false,
  className,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <VaultLabelledStat showLabel={showLabel} label={t(label)} tooltip={loading ? null : tooltip}>
      {loading ? (
        '...'
      ) : (
        <>
          <div
            className={clsx(classes.value, {
              [classes.blurValue]: blur,
              [classes.boostedValue]: boosted,
              [className]: className,
            })}
          >
            {isValueString ? t(`${value}`) : value}
          </div>
          {subValue ? (
            <div
              className={clsx(classes.subValue, {
                [classes.blurValue]: blur,
                [classes.lineThroughValue]: boosted,
              })}
            >
              {subValue}
            </div>
          ) : null}
        </>
      )}
    </VaultLabelledStat>
  );
});
