import * as React from 'react';
import { FC, memo, MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { ClickAwayListener, makeStyles } from '@material-ui/core';
import { orderBy } from 'lodash';
import { styles } from './styles';
import { ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import { Floating } from '../Floating';
import { Placement } from '@floating-ui/react-dom';

const useStyles = makeStyles(styles);

export type LabeledSelectCommonProps = {
  label?: string;
  options: Record<string, string>;
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
};

export type LabeledSelectProps = LabeledSelectCommonProps & {
  value: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  SelectedItemComponent?: FC<SelectedItemProps>;
  DropdownItemComponent?: FC<DropdownItemProps>;
  DropdownItemLabelComponent?: FC<DropdownItemLabelProps>;
  placement?: Placement;
  showArrow?: boolean;
};

type DropdownItemProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  DropdownItemLabelComponent?: FC<DropdownItemLabelProps>;
};

export type DropdownItemLabelProps = {
  label: string;
  value: string;
};

export type SelectedItemProps = {
  value: LabeledSelectProps['value'];
  options: LabeledSelectProps['options'];
};

function useSortedOptions(
  options: LabeledSelectProps['options'],
  sort: LabeledSelectProps['sortOptions'],
  defaultValue: LabeledSelectProps['defaultValue']
) {
  return useMemo(() => {
    const values = Object.entries(options).map(([value, label]) => ({
      value,
      label,
      isDefault: value === defaultValue,
    }));
    return sort === 'value' || sort === 'label'
      ? orderBy(values, ['isDefault', sort], ['desc', 'asc'])
      : values;
  }, [options, sort, defaultValue]);
}

const DropdownItem = memo<DropdownItemProps>(function DropdownItem({
  label,
  value,
  onChange,
  className,
  DropdownItemLabelComponent = DropdownItemLabel,
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
      <DropdownItemLabelComponent value={value} label={label} />
    </div>
  );
});

const DropdownItemLabel = memo<DropdownItemLabelProps>(function DropdownItem({ label }) {
  return <>{label}</>;
});

const SelectedItem = memo<SelectedItemProps>(function ({ value, options }) {
  return <>{options[value]}</>;
});

export const LabeledSelect = memo<LabeledSelectProps>(function LabeledSelect({
  label,
  value,
  defaultValue = 'default',
  onChange,
  options,
  sortOptions = 'default',
  fullWidth = false,
  borderless = false,
  disabled = false,
  SelectedItemComponent = SelectedItem,
  DropdownItemComponent = DropdownItem,
  DropdownItemLabelComponent = DropdownItemLabel,
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
}) {
  const baseClasses = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = useRef<HTMLButtonElement | null>(null);
  const optionsList = useSortedOptions(options, sortOptions, defaultValue);
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

  const handleChange = useCallback(
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
