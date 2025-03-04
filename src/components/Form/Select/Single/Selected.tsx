import { forwardRef, memo, type Ref } from 'react';
import type { SelectItem, SelectedSingleProps } from '../types.ts';
import { SelectButton } from '../SelectButton.tsx';
import { SelectLabelPrefix } from '../SelectLabelPrefix.tsx';
import { SelectArrow } from '../SelectArrow.tsx';
import { SelectLabel } from '../SelectLabel.tsx';

export const Selected = memo(
  forwardRef(function Selected<TItem extends SelectItem = SelectItem>(
    {
      labelPrefix,
      unselectedLabel,
      item,
      getProps,
      ButtonComponent = SelectButton,
      LabelPrefixComponent = SelectLabelPrefix,
      LabelComponent = SelectLabel,
      ...buttonVariantProps
    }: SelectedSingleProps<TItem>,
    ref: Ref<HTMLButtonElement>
  ) {
    const selected = !!item;
    const label = item ? item.label : unselectedLabel;

    return (
      <ButtonComponent {...getProps()} ref={ref} selected={selected} {...buttonVariantProps}>
        {labelPrefix && (
          <LabelPrefixComponent selected={selected}>{labelPrefix}</LabelPrefixComponent>
        )}
        <LabelComponent selected={selected}>{label}</LabelComponent>
        <SelectArrow active={buttonVariantProps.active} />
      </ButtonComponent>
    );
  })
);
