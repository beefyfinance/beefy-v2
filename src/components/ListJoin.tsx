import type { ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

type ListJoinProps = {
  items: ReactNode[];
  mode?: 'and' | 'or';
};
export const ListJoin = memo(function ListJoin({ items, mode = 'and' }: ListJoinProps) {
  const { t } = useTranslation();
  const comma = t('List-Join-Comma');
  const and = t(mode === 'or' ? 'List-Join-Or' : 'List-Join-And');

  if (items.length === 0) {
    return <></>;
  }

  if (items.length === 1) {
    return <>{items[0]}</>;
  }

  if (items.length === 2) {
    return (
      <>
        {items[0]}
        {and}
        {items[1]}
      </>
    );
  }

  const andIndex = items.length - 2;
  const nodes: ReactNode[] = [];

  for (let i = 0; i < items.length; ++i) {
    nodes.push(items[i]);
    if (i === andIndex) {
      nodes.push(and);
    } else if (i < andIndex) {
      nodes.push(comma);
    }
  }

  return <>{nodes}</>;
});
