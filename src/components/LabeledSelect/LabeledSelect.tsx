import type { FC, MouseEventHandler } from 'react';
import * as React from 'react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ClickAwayListener, makeStyles } from '@material-ui/core';
import { orderBy } from 'lodash-es';
import { styles } from './styles';
import { ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import { Floating } from '../Floating';
import type { Placement } from '@floating-ui/react-dom';
import { entries } from '../../helpers/object';

const useStyles = makeStyles(styles);

export type LabeledSelectCommonProps<V extends string = string> = {
  label?: string;
  options: Partial<Record<V, string>>;
  placement?: Placement;
  sortOptions?: 'default' | 'value' | 'label';
  fullWidth?: boolean;
  borderless?: boolean;
  disabled?: boolean;
  selectClass?: string;
  selectCurrentClass?: string;
  selectLabelClass?: string;
  selectValueClass?: string;
  selectIconClass?: string;
  selectFullWidthClass?: string;
  selectBorderlessClass?: string;
  selectOpenClass?: string;
  dropdownClass?: string;
  dropdownItemClass?: string;
  dropdownItemSelectedClass?: string;
  dropdownAutoWidth?: boolean;
  dropdownAutoHeight?: boolean;
  dropdownAutoHide?: boolean;
  dropdownFlip?: boolean;
  dropdownShift?: boolean;
};

export type LabeledSelectProps<V extends string = string> = LabeledSelectCommonProps<V> & {
  value: V;
  defaultValue?: V | 'default';
  onChange: (value: V) => void;
  SelectedItemComponent?: FC<SelectedItemProps<V>>;
  DropdownItemComponent?: FC<DropdownItemProps<V>>;
  DropdownItemLabelComponent?: FC<DropdownItemLabelProps<V>>;

  showArrow?: boolean;
};

type DropdownItemProps<V extends string = string> = {
  label: string;
  value: V;
  onChange: (value: V) => void;
  className?: string;
  DropdownItemLabelComponent?: FC<DropdownItemLabelProps<V>>;
};

export type DropdownItemLabelProps<V extends string = string> = {
  label: string;
  value: V;
};

export type SelectedItemProps<V extends string = string> = {
  value: LabeledSelectProps<V>['value'];
  options: LabeledSelectProps<V>['options'];
};

function useSortedOptions<V extends string = string>(
  options: LabeledSelectProps<V>['options'],
  sort: LabeledSelectProps<V>['sortOptions'],
  defaultValue: LabeledSelectProps<V>['defaultValue']
): { value: V; label: string; isDefault: boolean }[] {
  return useMemo(() => {
    const values = entries(options as Record<V, string>).map(([value, label]) => ({
      value,
      label,
      isDefault: value === defaultValue,
    }));
    return sort === 'value' || sort === 'label'
      ? orderBy(values, ['isDefault', sort], ['desc', 'asc'])
      : values;
  }, [options, sort, defaultValue]);
}

const DropdownItem = memo(function DropdownItem<V extends string = string>({
  label,
  value,
  onChange,
  className,
  DropdownItemLabelComponent = DropdownItemLabel<V>,
}: DropdownItemProps<V>) {
  const handleChange = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      onChange(value);
    },
    [onChange, value]
  );

  return (
    <div onClick={handleChange} className={className}>
      <DropdownItemLabelComponent value={value} label={label} />
    </div>
  );
});

const DropdownItemLabel = memo(function DropdownItemLabel<V extends string = string>({
  label,
}: DropdownItemLabelProps<V>) {
  return <>{label}</>;
});

const SelectedItem = memo(function SelectedItem<V extends string = string>({
  value,
  options,
}: SelectedItemProps<V>) {
  return <>{options[value]}</>;
});

export const LabeledSelect = memo(function LabeledSelect<V extends string = string>({
  label,
  value,
  defaultValue = 'default',
  onChange,
  options,
  sortOptions = 'default',
  fullWidth = false,
  borderless = false,
  disabled = false,
  SelectedItemComponent = SelectedItem<V>,
  DropdownItemComponent = DropdownItem<V>,
  DropdownItemLabelComponent = DropdownItemLabel<V>,
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
  dropdownAutoWidth = true,
  dropdownAutoHeight = true,
  dropdownAutoHide = true,
  placement = 'bottom-start',
  showArrow = true,
}: LabeledSelectProps<V>) {
  const baseClasses = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = useRef<HTMLButtonElement>(null);
  const optionsList = useSortedOptions<V>(options, sortOptions, defaultValue);
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

  const handleChange = useCallback<LabeledSelectProps<V>['onChange']>(
    value => {
      setIsOpen(false);
      onChange(value);
    },
    [setIsOpen, onChange]
  );

  return (
    <ClickAwayListener onClickAway={handleClose} mouseEvent="onMouseDown" touchEvent="onTouchStart">
      <button
        onClick={disabled ? undefined : handleToggle}
        ref={anchorEl}
        className={clsx(classes.select, {
          [classes.selectBorderless]: borderless,
          [classes.selectFullWidth]: fullWidth,
          [classes.selectOpen]: isOpen,
          [classes.selectDisabled]: disabled,
        })}
      >
        <div className={classes.selectCurrent}>
          {label ? <div className={classes.selectLabel}>{label}</div> : null}
          <div className={classes.selectValue}>
            <SelectedItemComponent options={options} value={value} />
          </div>
          {showArrow && <ExpandMore className={classes.selectIcon} />}
        </div>
        <Floating
          open={isOpen}
          anchorEl={anchorEl}
          placement={placement}
          className={classes.dropdown}
          autoWidth={dropdownAutoWidth}
          autoHeight={dropdownAutoHeight}
          autoHide={dropdownAutoHide}
        >
          {optionsList.map(({ value: optionValue, label }) => (
            <DropdownItemComponent
              key={optionValue}
              onChange={handleChange}
              label={label}
              value={optionValue}
              DropdownItemLabelComponent={DropdownItemLabelComponent}
              className={clsx(classes.dropdownItem, {
                [classes.dropdownItemSelected]: optionValue === value,
              })}
            />
          ))}
        </Floating>
      </button>
    </ClickAwayListener>
  );
});
