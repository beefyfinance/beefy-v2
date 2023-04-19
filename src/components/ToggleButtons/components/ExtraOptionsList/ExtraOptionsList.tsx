import { ClickAwayListener, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import type { FC, MouseEventHandler } from 'react';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Floating } from '../../../Floating';
import { styles } from '../../styles';
import type { ToggleButtonProps } from '../../ToggleButtons';
import { ToggleButton } from '../../ToggleButtons';
import { MoreVertRounded } from '@material-ui/icons';

const useStyles = makeStyles(styles);

interface ExtraOptionsListProps {
  ButtonComponent?: FC<ToggleButtonProps>;
  extraOptions: Record<string, string>;
  onClick: (value: string) => void;
  value: string;
  buttonClass?: string;
  selectedClass?: string;
}

export const ExtraOptionsList = memo<ExtraOptionsListProps>(function ExtraOptionsList({
  extraOptions,
  ButtonComponent = ToggleButton,
  onClick,
  value,
  buttonClass,
  selectedClass,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const anchorEl = useRef<HTMLDivElement | null>(null);
  const handleToggle = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      setIsOpen(open => !open);
    },
    [setIsOpen]
  );
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const optionsList = useMemo(
    () => Object.entries(extraOptions).map(([value, label]) => ({ value, label })),
    [extraOptions]
  );

  const extraListOptionSelected = useMemo(() => {
    return Object.keys(extraOptions).includes(value);
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClose} mouseEvent="onMouseDown" touchEvent="onTouchStart">
      <div
        className={clsx(classes.container, { [classes.selectedList]: extraListOptionSelected })}
        onClick={handleToggle}
        ref={anchorEl}
      >
        {t('More')}
        <MoreVertRounded className={classes.icon} />
        <Floating
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-end"
          className={classes.dropdown}
          display="flex"
          autoWidth={false}
        >
          {optionsList.map(({ value: optionValue, label }) => (
            <ButtonComponent
              key={optionValue}
              value={optionValue}
              label={label}
              onClick={onClick}
              className={clsx(classes.buttonList, buttonClass, {
                [clsx(classes.selectedList, selectedClass)]: value === optionValue,
              })}
            />
          ))}
        </Floating>
      </div>
    </ClickAwayListener>
  );
});
