import * as React from 'react';
import { memo, MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { ClickAwayListener, makeStyles } from '@material-ui/core';
import { orderBy } from 'lodash';
import { styles } from './styles';
import { ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import { Floating } from '../Floating';

const useStyles = makeStyles(styles);

export type LabeledSelectCommonProps = {
  label: string;
  options: Record<string, string>;
  sortOptions?: 'default' | 'value' | 'label';
  fullWidth?: boolean;
  borderless?: boolean;
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
};

export type LabeledSelectProps = LabeledSelectCommonProps & {
  value: string;
  defaultValue?: string;
  onChange: (value: string) => void;
};

type DropdownItemProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
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
      {label}
    </div>
  );
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
          <div className={classes.selectValue}>{options[value]}</div>
          <ExpandMore className={classes.selectIcon} />
        </div>
        <Floating
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          className={classes.dropdown}
        >
          {optionsList.map(({ value: optionValue, label }) => (
            <DropdownItem
              key={optionValue}
              onChange={handleChange}
              label={label}
              value={optionValue}
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
