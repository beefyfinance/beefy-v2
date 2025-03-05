import { forwardRef, memo, type Ref } from 'react';
import type { SelectItem, OptionProps } from './types.ts';
import { OptionBadge } from './OptionBadge.tsx';

export const Option = memo(
  forwardRef(function Option<TItem extends SelectItem = SelectItem>(
    {
      index,
      item,
      active,
      selected,
      getProps,
      allSelected = false,
      noneSelected = false,
      ButtonComponent,
      LabelComponent,
      IconComponent,
      BadgeComponent = OptionBadge,
    }: OptionProps<TItem>,
    ref: Ref<HTMLButtonElement>
  ) {
    return (
      <ButtonComponent {...getProps(index)} ref={ref} active={active} selected={selected}>
        {IconComponent && (
          <IconComponent
            item={item}
            selected={selected}
            allSelected={allSelected}
            noneSelected={noneSelected}
          />
        )}
        <LabelComponent selected={selected}>{item.label}</LabelComponent>
        {item.badge && <BadgeComponent selected={selected}>{item.badge}</BadgeComponent>}
      </ButtonComponent>
    );
  })
);
