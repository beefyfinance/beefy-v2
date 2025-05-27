import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { LabelledCheckboxProps } from '../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { LabelledCheckbox } from '../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';

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
    <Toggles className={css(cssProp)}>
      <div>
        <LineToggle
          checked={toggles.average}
          color="#4DB258"
          label={t('Average')}
          onChange={handleChange}
          toggle={'average'}
        />
      </div>
      <div>
        <LineToggle
          checked={toggles.movingAverage}
          color="#5C70D6"
          label={t('Moving-Average')}
          onChange={handleChange}
          toggle={'movingAverage'}
        />
      </div>
    </Toggles>
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
      containerCss={styles.container}
      iconCss={styles.toggleIcon}
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
  return (
    <>
      <ToggleLabelLine style={{ backgroundColor: color }} />
      {text}
    </>
  );
});

const Toggles = styled('div', {
  base: {
    display: 'flex',
    gap: '4px 16px',
    flexWrap: 'wrap',
  },
});

const ToggleLabelLine = styled('span', {
  base: {
    height: '2px',
    width: '12px',
  },
});

const styles = {
  container: css.raw({
    paddingBlock: '0px',
  }),
  toggleIcon: css.raw({
    width: '16px',
    height: '16px',
  }),
  toggleLabel: css.raw({
    textStyle: 'subline.sm',
    display: 'flex',
    gap: '8px',
    color: 'text.dark',
    whiteSpace: 'nowrap',
    paddingBlock: '0px',
  }),
};
