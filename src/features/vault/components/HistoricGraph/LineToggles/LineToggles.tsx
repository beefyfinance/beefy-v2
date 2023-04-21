import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import type { LabelledCheckboxProps } from '../../../../../components/LabelledCheckbox';
import { LabelledCheckbox } from '../../../../../components/LabelledCheckbox';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type LineTogglesState = {
  average: boolean;
  movingAverage: boolean;
};

export type LineTogglesProps = {
  className?: string;
  toggles: LineTogglesState;
  onChange: (newToggles: LineTogglesState) => void;
};

export const LineToggles = memo<LineTogglesProps>(function LineToggles({
  toggles,
  onChange,
  className,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const handleChange = useCallback<LineToggleProps['onChange']>(
    (key, nowChecked) => {
      onChange({ ...toggles, [key]: nowChecked });
    },
    [toggles, onChange]
  );

  return (
    <div className={clsx(classes.toggles, className)}>
      <LineToggle
        checked={toggles.average}
        color="#59A662"
        label={t('Average')}
        onChange={handleChange}
        toggle={'average'}
      />
      <LineToggle
        checked={toggles.movingAverage}
        color="#5C99D6"
        label={t('Moving-Average')}
        onChange={handleChange}
        toggle={'movingAverage'}
      />
    </div>
  );
});

type LineToggleProps = {
  checked: boolean;
  color: string;
  label: string;
  toggle: keyof LineTogglesState;
  onChange: (key: keyof LineTogglesState, e: boolean) => void;
};

const LineToggle = memo<LineToggleProps>(function LineToggle({
  checked,
  color,
  label,
  toggle,
  onChange,
}) {
  const classes = useStyles();
  const handleChange = useCallback<LabelledCheckboxProps['onChange']>(
    nowChecked => onChange(toggle, nowChecked),
    [toggle, onChange]
  );

  return (
    <LabelledCheckbox
      iconClass={classes.toggleIcon}
      checkboxClass={classes.toggleCheckbox}
      labelClass={classes.toggleLabel}
      checked={checked}
      onChange={handleChange}
      label={<LineToggleLabel text={label} color={color} />}
    />
  );
});

type LineToggleLabelProps = {
  text: string;
  color: string;
};
const LineToggleLabel = memo<LineToggleLabelProps>(function LineToggleLabel({ text, color }) {
  const classes = useStyles();
  return (
    <>
      <span style={{ backgroundColor: color }} className={classes.toggleLabelLine} />
      {text}
    </>
  );
});
