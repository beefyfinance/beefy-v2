import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import type { LabelledCheckboxProps } from '../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { LabelledCheckbox } from '../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type LineTogglesState = {
  average: boolean;
  movingAverage: boolean;
};

export type LineTogglesProps = {
  css?: CssStyles;
  toggles: LineTogglesState;
  onChange: (newToggles: LineTogglesState) => void;
};

export const LineToggles = memo(function LineToggles({
  toggles,
  onChange,
  css: cssProp,
}: LineTogglesProps) {
  const { t } = useTranslation();
  const handleChange = useCallback<LineToggleProps['onChange']>(
    (key, nowChecked) => {
      onChange({ ...toggles, [key]: nowChecked });
    },
    [toggles, onChange]
  );

  return (
    <div className={css(styles.toggles, cssProp)}>
      <LineToggle
        checked={toggles.average}
        color="#4DB258"
        label={t('Average')}
        onChange={handleChange}
        toggle={'average'}
      />
      <LineToggle
        checked={toggles.movingAverage}
        color="#5C70D6"
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

const LineToggle = memo(function LineToggle({
  checked,
  color,
  label,
  toggle,
  onChange,
}: LineToggleProps) {
  const handleChange = useCallback<LabelledCheckboxProps['onChange']>(
    nowChecked => onChange(toggle, nowChecked),
    [toggle, onChange]
  );

  return (
    <LabelledCheckbox
      iconCss={styles.toggleIcon}
      checkboxCss={styles.toggleCheckbox}
      labelCss={styles.toggleLabel}
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
const LineToggleLabel = memo(function LineToggleLabel({ text, color }: LineToggleLabelProps) {
  const classes = useStyles();
  return (
    <>
      <span style={{ backgroundColor: color }} className={classes.toggleLabelLine} />
      {text}
    </>
  );
});
