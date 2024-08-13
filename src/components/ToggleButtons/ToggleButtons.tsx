import type { FC, ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { ExtraOptionsList } from './components/ExtraOptionsList';

const useStyles = makeStyles(styles);

export type ToggleButtonProps = {
  value: string;
  label: ReactNode;
  onClick: (value: string) => void;
  className?: string;
};

export type ToggleButtonsProps = {
  value: string;
  options: Record<string, string>;
  extraOptions?: Record<string, string>;
  fullWidth?: boolean;
  buttonsClass?: string;
  buttonClass?: string;
  selectedClass?: string;
  untogglableClass?: string;
  onChange: (value: string) => void;
  ButtonComponent?: FC<ToggleButtonProps>;
  /** set this to 'all' key */
  untoggleValue?: string;
};

export const ToggleButton = memo<ToggleButtonProps>(function ToggleButton({
  value,
  label,
  onClick,
  className,
}) {
  const handleClick = useCallback(() => {
    onClick(value);
  }, [value, onClick]);

  return (
    <button className={className} onClick={handleClick}>
      {label}
    </button>
  );
});

export const ToggleButtons = memo<ToggleButtonsProps>(function ToggleButtons({
  value,
  options,
  extraOptions,
  fullWidth,
  buttonsClass,
  buttonClass,
  selectedClass,
  untogglableClass,
  onChange,
  ButtonComponent = ToggleButton,
  untoggleValue,
}) {
  const baseClasses = useStyles();
  const optionsList = useMemo(
    () => Object.entries(options).map(([value, label]) => ({ value, label })),
    [options]
  );

  const handleClick = useCallback(
    newValue => {
      if (untoggleValue) {
        onChange(newValue === value ? untoggleValue : newValue);
      } else {
        onChange(newValue);
      }
    },
    [onChange, untoggleValue, value]
  );

  return (
    <div
      className={clsx(baseClasses.buttons, buttonsClass, {
        [baseClasses.fullWidth]: fullWidth,
        [clsx(baseClasses.untogglable, untogglableClass)]: untoggleValue !== undefined,
      })}
    >
      {optionsList.map(({ value: optionValue, label }) => (
        <ButtonComponent
          key={optionValue}
          value={optionValue}
          label={label}
          onClick={handleClick}
          className={clsx(baseClasses.button, buttonClass, {
            [clsx(baseClasses.selected, selectedClass)]: value === optionValue,
          })}
        />
      ))}
      {extraOptions && (
        <ExtraOptionsList
          ButtonComponent={ButtonComponent}
          extraOptions={extraOptions}
          onClick={handleClick}
          value={value}
          buttonClass={buttonClass}
          selectedClass={selectedClass}
        />
      )}
    </div>
  );
});

export type MultiToggleButtonProps = Omit<ToggleButtonProps, 'onClick'> & {
  isSelected: boolean;
  onClick: (isSelected: boolean, value: string) => void;
};

export const MultiToggleButton = memo<MultiToggleButtonProps>(function ToggleButton({
  value,
  label,
  onClick,
  isSelected,
  className,
}) {
  const handleClick = useCallback(() => {
    onClick(!isSelected, value);
  }, [onClick, isSelected, value]);

  return (
    <button className={className} onClick={handleClick}>
      {label}
    </button>
  );
});

type MultiToggleButtonsProps = Omit<
  ToggleButtonsProps,
  'value' | 'extraOptions' | 'onChange' | 'ButtonComponent'
> & {
  value: string[];
  onChange: (value: string[]) => void;
  ButtonComponent?: FC<MultiToggleButtonProps>;
};

export const MultiToggleButtons = memo<MultiToggleButtonsProps>(function MultiToggleButtons({
  value,
  options,
  fullWidth,
  buttonsClass,
  buttonClass,
  selectedClass,
  untogglableClass,
  onChange,
  ButtonComponent = MultiToggleButton,
  untoggleValue,
}) {
  const baseClasses = useStyles();
  const optionsList = useMemo(
    () => Object.entries(options).map(([value, label]) => ({ value, label })),
    [options]
  );

  const handleClick = useCallback(
    (isSelected, id) => {
      onChange(isSelected ? [...value, id] : value.filter(selectedId => selectedId !== id));
    },
    [onChange, value]
  );

  return (
    <div
      className={clsx(baseClasses.buttons, buttonsClass, {
        [baseClasses.fullWidth]: fullWidth,
        [clsx(baseClasses.untogglable, untogglableClass)]: untoggleValue !== undefined,
      })}
    >
      {optionsList.map(({ value: optionValue, label }) => (
        <ButtonComponent
          key={optionValue}
          value={optionValue}
          label={label}
          isSelected={value.includes(optionValue)}
          onClick={handleClick}
          className={clsx(baseClasses.button, buttonClass, {
            [clsx(baseClasses.selected, selectedClass)]: value.includes(optionValue),
          })}
        />
      ))}
    </div>
  );
});
