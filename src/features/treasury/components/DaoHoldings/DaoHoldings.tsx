import { makeStyles } from '@material-ui/styles';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { Section } from '../../../../components/Section';
import { useAppSelector } from '../../../../store';
import { selectTreasury } from '../../../data/selectors/treasury';
import { ChainHolding } from './components/ChainHolding';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const DaoHoldings = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  const treasury = useAppSelector(selectTreasury);

  const breakpoints = { default: 3, 1296: 2, 960: 1 };

  return (
    <Section title={t('Treasury-Title-Holdings')}>
      <Masonry
        className={classes.container}
        columnClassName={classes.columnClassName}
        breakpointCols={breakpoints}
      >
        {Object.entries(treasury).map(([chainId]) => (
          <ChainHolding key={chainId} chainId={chainId} />
        ))}
      </Masonry>
    </Section>
  );
});
