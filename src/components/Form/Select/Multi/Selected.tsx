import { forwardRef, memo, type Ref } from 'react';
import type { SelectedMultiProps, SelectItem } from '../types.ts';
import { SelectButton } from '../SelectButton.tsx';
import { SelectLabelPrefix } from '../SelectLabelPrefix.tsx';
import { SelectArrow } from '../SelectArrow.tsx';
import { SelectLabel } from '../SelectLabel.tsx';
import { useTranslation } from 'react-i18next';

export const Selected = memo(
  forwardRef(function Selected<TItem extends SelectItem = SelectItem>(
    {
      labelPrefix,
      unselectedLabel,
      allSelectedLabel,
      allSelected,
      items,
      getProps,
      ButtonComponent = SelectButton,
      LabelPrefixComponent = SelectLabelPrefix,
      LabelComponent = SelectLabel,
      ...buttonVariantProps
    }: SelectedMultiProps<TItem>,
    ref: Ref<HTMLButtonElement>
  ) {
    const { t } = useTranslation();
    const selected = !!items && items.length > 0;
    const label =
      allSelected && allSelectedLabel ? allSelectedLabel
      : selected ?
        items.length === 1 ?
          items[0].label
        : t('Select-CountSelected', { count: items.length })
      : unselectedLabel;

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
