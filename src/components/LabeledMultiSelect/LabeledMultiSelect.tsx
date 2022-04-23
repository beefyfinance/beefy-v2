import * as React from 'react';
import { FC, memo, MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { ClickAwayListener, makeStyles } from '@material-ui/core';
import { sortBy } from 'lodash';
import { CheckBox, CheckBoxOutlineBlank, ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import { Floating } from '../Floating';
import { LabeledSelectCommonProps } from '../LabeledSelect';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export type LabeledMultiSelectProps = LabeledSelectCommonProps & {
  value: string[];
  /** If provided will insert an all checkbox as first option */
  allLabel?: string;
  allSelectedLabel?: string;
  countSelectedLabel?: string;
  onChange: (value: string[]) => void;
  SelectedItemComponent?: FC<SelectedItemProps>;
};

type DropdownItemProps = {
  label: string;
  value: string;
  selected: boolean;
  onChange: (value: string) => void;
  className?: string;
};

export type SelectedItemProps = {
  value: LabeledMultiSelectProps['value'];
  options: LabeledMultiSelectProps['options'];
  allSelected: boolean;
  allSelectedLabel: LabeledMultiSelectProps['allSelectedLabel'];
  countSelectedLabel: LabeledMultiSelectProps['countSelectedLabel'];
};

function useSortedOptions(
  options: LabeledMultiSelectProps['options'],
  sort: LabeledMultiSelectProps['sortOptions']
) {
  return useMemo(() => {
    const values = Object.entries(options).map(([value, label]) => ({
      value,
      label,
    }));
    return sort === 'value' || sort === 'label' ? sortBy(values, sort) : values;
  }, [options, sort]);
}

const DropdownItem = memo<DropdownItemProps>(function DropdownItem({
  label,
  value,
  onChange,
  className,
  selected,
}) {
  const handleChange = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      onChange(value);
    },
    [onChange, value]
  );

  return (
    <div onClick={handleChange} className={className}>
      {selected ? <CheckBox /> : <CheckBoxOutlineBlank />} {label}
    </div>
  );
});

const SelectedItem = memo<SelectedItemProps>(function ({
  value,
  options,
  allSelected,
  allSelectedLabel,
  countSelectedLabel,
}) {
  const { t } = useTranslation();
  let message: string;

  if (allSelected) {
    message = t(allSelectedLabel);
  } else if (value.length === 1) {
    const key = value[0];
    message = options[key];
  } else {
    message = t(countSelectedLabel, { count: value.length });
  }

  return <>{message}</>;
});

export const LabeledMultiSelect = memo<LabeledMultiSelectProps>(function LabeledMultiSelect({
  label,
  value,
  allLabel,
  allSelectedLabel = 'Select-AllSelected',
  countSelectedLabel = 'Select-CountSelected',
  onChange,
  options,
  sortOptions = 'default',
  fullWidth = false,
  borderless = false,
  SelectedItemComponent = SelectedItem,
  selectClass,
  selectCurrentClass,
  selectLabelClass,
  selectValueClass,
  selectIconClass,
  selectFullWidthClass,
  selectBorderlessClass,
  selectOpenClass,
  dropdownClass,
  dropdownItemClass,
  dropdownItemSelectedClass,
}) {
  const baseClasses = useStyles();
  const allKey = 'all';
  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = useRef<HTMLButtonElement | null>(null);
  const optionsList = useSortedOptions(options, sortOptions);
  const classes = useMemo<typeof baseClasses>(
    () => ({
      ...baseClasses,
      select: clsx(baseClasses.select, selectClass),
      selectCurrent: clsx(baseClasses.selectCurrent, selectCurrentClass),
      selectLabel: clsx(baseClasses.selectLabel, selectLabelClass),
      selectValue: clsx(baseClasses.selectValue, selectValueClass),
      selectIcon: clsx(baseClasses.selectIcon, selectIconClass),
      selectFullWidth: clsx(baseClasses.selectFullWidth, selectFullWidthClass),
      selectBorderless: clsx(baseClasses.selectBorderless, selectBorderlessClass),
      selectOpen: clsx(baseClasses.selectOpen, selectOpenClass),
      dropdown: clsx(baseClasses.dropdown, dropdownClass),
      dropdownItem: clsx(baseClasses.dropdownItem, dropdownItemClass),
      dropdownItemSelected: clsx(baseClasses.dropdownItemSelected, dropdownItemSelectedClass),
    }),
    [
      baseClasses,
      selectClass,
      selectCurrentClass,
      selectLabelClass,
      selectValueClass,
      selectIconClass,
      selectFullWidthClass,
      selectBorderlessClass,
      selectOpenClass,
      dropdownClass,
      dropdownItemClass,
      dropdownItemSelectedClass,
    ]
  );
  const allOptionEnabled = !!allLabel;
  const allSelected = value.length === sortOptions.length || value.length === 0;

  const handleToggle = useCallback<MouseEventHandler<HTMLButtonElement>>(
    e => {
      e.stopPropagation();
      setIsOpen(open => !open);
    },
    [setIsOpen]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleChange = useCallback(
    changedValue => {
      if (changedValue === allKey) {
        onChange(Object.keys(options));
      } else {
        if (value.includes(changedValue)) {
          onChange(value.filter(v => v !== changedValue));
        } else {
          onChange([...value, changedValue]);
        }
      }
    },
    [value, options, onChange, allKey]
  );

  return (
    <ClickAwayListener onClickAway={handleClose} mouseEvent="onMouseDown" touchEvent="onTouchStart">
      <button
        onClick={handleToggle}
        ref={anchorEl}
        className={clsx(classes.select, {
          [classes.selectBorderless]: borderless,
          [classes.selectFullWidth]: fullWidth,
          [classes.selectOpen]: isOpen,
        })}
      >
        <div className={classes.selectCurrent}>
          <div className={classes.selectLabel}>{label}</div>
          <div className={classes.selectValue}>
            <SelectedItemComponent
              value={value}
              options={options}
              allSelected={allSelected}
              allSelectedLabel={allSelectedLabel}
              countSelectedLabel={countSelectedLabel}
            />
          </div>
          <ExpandMore className={classes.selectIcon} />
        </div>
        <Floating
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          className={classes.dropdown}
        >
          {allOptionEnabled ? (
            <DropdownItem
              onChange={handleChange}
              label={allLabel}
              value={allKey}
              selected={allSelected}
              className={clsx(classes.dropdownItem, {
                [classes.dropdownItemSelected]: allSelected,
              })}
            />
          ) : null}
          {optionsList.map(({ value: optionValue, label }) => (
            <DropdownItem
              key={optionValue}
              onChange={handleChange}
              label={label}
              value={optionValue}
              selected={value.includes(optionValue)}
              className={clsx(classes.dropdownItem, {
                [classes.dropdownItemSelected]: value.includes(optionValue),
              })}
            />
          ))}
        </Floating>
      </button>
    </ClickAwayListener>
  );
});
