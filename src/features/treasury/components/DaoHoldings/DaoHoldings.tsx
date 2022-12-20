import { makeStyles } from '@material-ui/styles';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { Section } from '../../../../components/Section';
import { useAppSelector } from '../../../../store';
import { selectTreasurySorted } from '../../../data/selectors/treasury';
import { ChainHolding } from './components/ChainHolding';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const DaoHoldings = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  const sortedTreasury = useAppSelector(selectTreasurySorted);

  const breakpoints = { default: 3, 1296: 2, 960: 1 };

  return (
    <Section title={t('Treasury-Title-Holdings')}>
      <Masonry
        className={classes.container}
        columnClassName={classes.columnClassName}
        breakpointCols={breakpoints}
      >
        {Object.values(sortedTreasury).map(chain => (
          <ChainHolding key={chain.chainId} chainId={chain.chainId} />
        ))}
      </Masonry>
    </Section>
  );
});
