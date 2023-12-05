import { makeStyles } from '@material-ui/styles';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../components/Section';
import { useAppSelector } from '../../../../store';
import { selectTreasurySorted } from '../../../data/selectors/treasury';
import { ChainHolding, MMHolding } from './components/ChainHolding';
import { styles } from './styles';
import { useMediaQuery } from '@material-ui/core';

const useStyles = makeStyles(styles);

function useTreasuryColumns(numColumns: number) {
  const sortedTreasury = useAppSelector(selectTreasurySorted);

  return useMemo(() => {
    if (numColumns === 1) {
      return [sortedTreasury.map(chainTreasury => chainTreasury.id)];
    }

    const heights = new Array(numColumns).fill(0);
    const columns = heights.map(() => []);
    let nextColumn = 0;

    for (const treasury of sortedTreasury) {
      columns[nextColumn].push({ id: treasury.id, type: treasury.type });
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
  const isDesktop = useMediaQuery('(min-width: 1296px)', { noSsr: true });
  const isTablet = useMediaQuery('(min-width: 960px)', { noSsr: true });
  return useMemo(() => (isDesktop ? 3 : isTablet ? 2 : 1), [isDesktop, isTablet]);
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
              col.type === 'chain' ? (
                <ChainHolding key={col.id} chainId={col.id} />
              ) : (
                <MMHolding key={col.id} mmId={col.id} />
              )
            )}
          </div>
        ))}
      </div>
    </Section>
  );
});
