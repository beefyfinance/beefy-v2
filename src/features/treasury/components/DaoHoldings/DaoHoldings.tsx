import { makeStyles } from '@material-ui/styles';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../components/Section';
import { useAppSelector } from '../../../../store';
import { selectTreasurySorted } from '../../../data/selectors/treasury';
import { ChainHolding } from './components/ChainHolding';
import { styles } from './styles';
import { useMediaQuery } from '@material-ui/core';

const useStyles = makeStyles(styles);

function useTreasuryColumns(numColumns: number) {
  const sortedTreasury = useAppSelector(selectTreasurySorted);

  return useMemo(() => {
    if (numColumns === 1) {
      return [sortedTreasury.map(chainTreasury => chainTreasury.chainId)];
    }

    const heights = new Array(numColumns).fill(0);
    const columns = heights.map(() => []);
    let nextColumn = 0;

    for (const chainTreasury of sortedTreasury) {
      columns[nextColumn].push(chainTreasury.chainId);

      const numCategories =
        (chainTreasury.liquid > 0 ? 1 : 0) +
        (chainTreasury.staked > 0 ? 1 : 0) +
        (chainTreasury.locked > 0 ? 1 : 0);
      const numAssets = chainTreasury.liquid + chainTreasury.staked + chainTreasury.locked;
      const numRows = 2 + numCategories + numAssets;

      heights[nextColumn] +=
        64 + // chain header
        52 + // table header
        numCategories * 52 + // category headers
        numAssets * 76 + // asset rows
        (numRows - 1) * 2 + // row gaps
        (columns[nextColumn].length > 1 ? 16 : 0); // chain gap

      nextColumn = heights.indexOf(Math.min(...heights));
    }

    return columns;
  }, [sortedTreasury, numColumns]);
}

function useNumColumns() {
  const isDesktop = useMediaQuery('(min-width: 1296px)');
  const isTablet = useMediaQuery('(min-width: 960px)');
  return useMemo(() => (isDesktop ? 3 : isTablet ? 2 : 1), [isDesktop, isTablet]);
}

export const DaoHoldings = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const numColumns = useNumColumns();
  const treasuryColumns = useTreasuryColumns(numColumns);

  return (
    <Section title={t('Treasury-Title-Holdings')}>
      <div className={classes.masonry}>
        {treasuryColumns.map((columns, i) => (
          <div key={i} className={classes.column}>
            {columns.map(chainId => (
              <ChainHolding key={chainId} chainId={chainId} />
            ))}
          </div>
        ))}
      </div>
    </Section>
  );

  // const breakpoints = { default: 3, 1296: 2, 960: 1 };
  //
  //
  // return (
  //   <Section title={t('Treasury-Title-Holdings')}>
  //     <Masonry
  //       className={classes.container}
  //       columnClassName={classes.columnClassName}
  //       breakpointCols={breakpoints}
  //     >
  //       {Object.values(sortedTreasury).map(chain => (
  //         <ChainHolding key={chain.chainId} chainId={chain.chainId} />
  //       ))}
  //     </Masonry>
  //   </Section>
  // );
});
