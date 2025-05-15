import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '../../../../components/MediaQueries/useMediaQuery.ts';
import { Section } from '../../../../components/Section/Section.tsx';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { ChainEntity, ChainId } from '../../../data/entities/chain.ts';
import { selectTreasurySorted } from '../../../data/selectors/treasury.ts';
import { ChainHolding, MMHolding } from './components/ChainHolding/ChainHolding.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type TreasuryColumn =
  | {
      id: ChainId;
      type: 'chain';
    }
  | { id: string; type: 'mm' };

function useTreasuryColumns(numColumns: number) {
  const sortedTreasury = useAppSelector(selectTreasurySorted);

  return useMemo(() => {
    if (numColumns === 1) {
      return [
        sortedTreasury.map(chainTreasury => ({ id: chainTreasury.id, type: chainTreasury.type })),
      ];
    }

    const heights: number[] = new Array(numColumns).fill(0);
    const columns = heights.map(() => [] as Array<TreasuryColumn>);
    let nextColumn = 0;

    for (const treasury of sortedTreasury) {
      columns[nextColumn].push({ id: treasury.id, type: treasury.type } as TreasuryColumn);
      const numRows = 2 + treasury.categoryCount + treasury.assetCount;
      heights[nextColumn] +=
        64 + // chain header
        52 + // table header
        treasury.categoryCount * 52 + // category headers
        treasury.assetCount * 76 + // asset rows
        (numRows - 1) * 2 + // row gaps
        (columns[nextColumn].length > 1 ? 16 : 0); // chain gap

      nextColumn = heights.indexOf(Math.min(...heights));
    }

    return columns;
  }, [sortedTreasury, numColumns]);
}

function useNumColumns() {
  const isDesktop = useMediaQuery('(min-width: 1296px)', false);
  const isTablet = useMediaQuery('(min-width: 960px)', false);
  return useMemo(
    () =>
      isDesktop ? 3
      : isTablet ? 2
      : 1,
    [isDesktop, isTablet]
  );
}

export const DaoHoldings = memo(function DaoHoldings() {
  const { t } = useTranslation();
  const classes = useStyles();
  const numColumns = useNumColumns();
  const treasuryColumns = useTreasuryColumns(numColumns);

  return (
    <Section title={t('Treasury-Title-Holdings')}>
      <div className={classes.masonry}>
        {treasuryColumns.map((columns, i) => (
          <div key={i} className={classes.column}>
            {columns.map(col =>
              col.type === 'chain' ?
                <ChainHolding key={col.id} chainId={col.id as ChainEntity['id']} />
              : <MMHolding key={col.id} mmId={col.id} />
            )}
          </div>
        ))}
      </div>
    </Section>
  );
});
