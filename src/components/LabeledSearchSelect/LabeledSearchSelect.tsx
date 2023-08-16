import type { ChangeEvent } from 'react';
import { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { useAutocomplete } from '@material-ui/lab';
import { Trans, useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

interface LabeledSearchProps {
  id: string;
  onChange: (event: ChangeEvent, option: LabelSearchSelectOptionType) => void;
  options: LabelSearchSelectOptionType[];
  labelI18Key: string;
}

export interface LabelSearchSelectOptionType {
  label: string;
  value: string | null;
}

export const LabeledSearchSelect = memo<LabeledSearchProps>(function LabelesedSearchSelect({
  id,
  onChange,
  options,
  labelI18Key,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: `customized-search-select-${id}`,
    options,
    getOptionLabel: option => option.label,
    onChange,
  });
  return (
    <div {...getRootProps()}>
      <div ref={setAnchorEl} className={classes.inputWrapper}>
        {!focused && t(`Platform: aaa`)}
        <input value={null} {...getInputProps()} />
      </div>
      {groupedOptions.length > 0 && (
        <ul className={classes.dropdown} {...getListboxProps()}>
          {(groupedOptions satisfies LabelSearchSelectOptionType[]).map((option, index) => (
            <li
              className={classes.dropdownItem}
              key={option.value}
              {...getOptionProps({ option, index })}
            >
              <span>{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
