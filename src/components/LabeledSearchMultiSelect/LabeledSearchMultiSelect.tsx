import type { ChangeEvent, MouseEventHandler } from 'react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import type { LabeledMultiSelectProps } from '../LabeledMultiSelect';
import {
  SelectedMultiSelectItem,
  DropdownMultiSelectItem,
  DropdownMultiSelectItemLabel,
} from '../LabeledMultiSelect';
import { Floating } from '../Floating';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { ExpandMore } from '@material-ui/icons';
import { Search } from '../Search';
import { simplifySearchText, stringFoundAnywhere } from '../../helpers/string';
import { useTranslation } from 'react-i18next';

function useFilteredSortedOptions(options: LabeledMultiSelectProps['options'], inputText: string) {
  return useMemo(() => {
    const values = Object.entries(options).map(([value, label]) => ({
      value,
      label,
    }));

    if (inputText.length > 2) {
      return values.filter(option => {
        if (stringFoundAnywhere(simplifySearchText(option.label), inputText)) {
          return option;
        }
      });
    }

    return values;
  }, [inputText, options]);
}

const useStyles = makeStyles(styles);

export const LabeledSearchMultiSelect = memo<LabeledMultiSelectProps>(
  function LabeledSearchMultiSelect({
    label,
    options,
    value,
    sortOptions,
    allSelectedLabel = 'Select-AllSelected',
    countSelectedLabel = 'Select-CountSelected',
    noOptionsMessage = 'NoResults-NoResultsFound',
    SelectedItemComponent = SelectedMultiSelectItem,
    DropdownItemComponent = DropdownMultiSelectItem,
    DropdownItemLabelComponent = DropdownMultiSelectItemLabel,
    onChange,
    fullWidth = false,
    borderless = false,
  }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const allKey = 'all';
    const [inputText, setInputText] = useState<string>('');
    const anchorEl = useRef<HTMLButtonElement | null>(null);
    const optionsList = useFilteredSortedOptions(options, inputText);
    const allSelected = value.length === sortOptions?.length || value.length === 0;

    const handleToggle = useCallback<MouseEventHandler<HTMLButtonElement>>(
      e => {
        e.stopPropagation();
        setIsOpen(open => !open);
      },
      [setIsOpen]
    );

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      setInputText(event.target.value.toLocaleLowerCase());
    }, []);

    const handleClearInput = useCallback(() => {
      setInputText('');
    }, []);

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
        setInputText('');
      },
      [value, options, onChange, allKey]
    );

    const handleAvoidClosePopUp = useCallback<MouseEventHandler<HTMLInputElement>>(e => {
      e.stopPropagation();
    }, []);

    return (
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
          <div className={classes.inputContainer}>
            <Search
              autoFocus={true}
              searchText={inputText}
              handleSearchText={handleInputChange}
              handleClearText={handleClearInput}
              onClick={handleAvoidClosePopUp}
            />
          </div>
          {optionsList.map(({ value: optionValue, label }) => (
            <DropdownItemComponent
              key={optionValue}
              onChange={handleChange}
              label={label}
              value={optionValue}
              selected={value.includes(optionValue)}
              DropdownItemLabelComponent={DropdownItemLabelComponent}
              className={clsx(classes.dropdownItem, {
                [classes.dropdownItemSelected]: value.includes(optionValue),
              })}
            />
          ))}
          {inputText.length > 2 && optionsList.length === 0 && (
            <div
              aria-disabled={true}
              onClick={handleAvoidClosePopUp}
              className={classes.noResultItem}
            >
              {t(noOptionsMessage)}
            </div>
          )}
        </Floating>
      </button>
    );
  }
);
