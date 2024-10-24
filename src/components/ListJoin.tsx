import { isString } from 'lodash-es';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

type ListJoinProps = {
  items: string[] | ReactNode[];
};
export const ListJoin = memo<ListJoinProps>(function ListJoin({ items }) {
  const { t } = useTranslation();
  const comma = t('List-Join-Comma');
  const and = t('List-Join-And');

  if (items.length === 0) {
    return <></>;
  }

  if (items.length === 1) {
    return <>{isString(items[0]) ? replaceClmOrLp(items[0]) : items[0]}</>;
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

function replaceClmOrLp(item: string) {
  if (item.endsWith('rCLM')) {
    return item.replace('rCLM', '');
  }

  if (item.endsWith('CLM')) {
    return item.replace('CLM', '');
  }

  if (item.endsWith('LP')) {
    return item.replace('LP', '');
  }

  return item;
}
