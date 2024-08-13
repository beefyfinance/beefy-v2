import { makeStyles } from '@material-ui/core';
import type BigNumber from 'bignumber.js';
import { orderBy } from 'lodash-es';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentLoading } from '../../../../components/ContentLoading';
import { Section } from '../../../../components/Section';
import { formatLargeUsd } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import type { ChainEntity } from '../../../data/entities/chain';
import { selectChainById } from '../../../data/selectors/chains';
import { selectTvlByChain } from '../../../data/selectors/tvl';
import { styles } from './styles';
import { getNetworkSrc } from '../../../../helpers/networkSrc';
import { entries } from '../../../../helpers/object';

const useStyles = makeStyles(styles);

export const DaoInflows = memo(function DaoInflows() {
  const { t } = useTranslation();
  const classes = useStyles();

  const tvls = useAppSelector(selectTvlByChain);

  const sortedTvls = useMemo(() => {
    return orderBy(
      entries(tvls)
        .filter((entry): entry is [ChainEntity['id'], BigNumber] => !!(entry && entry[1]))
        .map(([chainId, tvl]) => ({
          chainId,
          tvl,
        })),
      e => e.tvl.toNumber(),
      'desc'
    );
  }, [tvls]);

  return (
    <Section title={t('Treasury-Title-Inflows')}>
      <div className={classes.container}>
        {sortedTvls.map(item => {
          return <Chain key={item.chainId} value={item.tvl} chainId={item.chainId} />;
        })}
      </div>
    </Section>
  );
});

interface ChainProps {
  chainId: ChainEntity['id'];
  value: BigNumber;
}

const Chain = memo<ChainProps>(function Chain({ chainId, value }) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <div className={classes.chain}>
      <img className={classes.chainLogo} alt={chain.id} src={getNetworkSrc(chain.id)} />
      <div>
        <div className={classes.chainText}>{chain.name}</div>
        <>
          {value ? (
            <div className={classes.chainValue}>{formatLargeUsd(value)}</div>
          ) : (
            <ContentLoading />
          )}
        </>
      </div>
    </div>
  );
});
