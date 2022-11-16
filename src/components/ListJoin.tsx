import { memo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type ListJoinProps = {
  items: ReactNode[];
};
export const ListJoin = memo<ListJoinProps>(function ({ items }) {
  const { t } = useTranslation();
  const comma = t('List-Join-Comma');
  const and = t('List-Join-And');

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
