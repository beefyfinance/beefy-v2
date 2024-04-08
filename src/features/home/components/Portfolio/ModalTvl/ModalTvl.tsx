import { Box, IconButton, makeStyles } from '@material-ui/core';
import React, { forwardRef, memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../vault/components/Card';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { selectActiveChainIds, selectChainById } from '../../../../data/selectors/chains';
import type { ChainEntity } from '../../../../data/entities/chain';
import { selectTvlByChain } from '../../../../data/selectors/tvl';
import type BigNumber from 'bignumber.js';
import { formatLargeUsd } from '../../../../../helpers/format';
import { ContentLoading } from '../../../../../components/ContentLoading';
import { Button } from '../../../../../components/Button';
import { useAppSelector } from '../../../../../store';
import { orderBy } from 'lodash-es';
import { getNetworkSrc } from '../../../../../helpers/networkSrc';
import { entries } from '../../../../../helpers/object';

const useStyles = makeStyles(styles);

export type ModalTvlProps = {
  close: () => void;
};

const _ModalTvl = forwardRef<HTMLDivElement, ModalTvlProps>(function ModalTvl({ close }, ref) {
  const classes = useStyles();
  const { t } = useTranslation();
  const tvls = useAppSelector(selectTvlByChain);
  const activeChainIds = useAppSelector(selectActiveChainIds);

  const sortedTvls = useMemo(() => {
    return orderBy(
      entries(tvls)
        .filter((entry): entry is [ChainEntity['id'], BigNumber] => !!(entry && entry[1]))
        .filter(([chainId]) => activeChainIds.includes(chainId))
        .map(([chainId, tvl]) => ({
          chainId,
          tvl,
        })),
      e => e.tvl.toNumber(),
      'desc'
    );
  }, [tvls, activeChainIds]);

  return (
    <div className={classes.holder} ref={ref} tabIndex={-1}>
      <Card className={classes.card}>
        <CardHeader className={classes.header}>
          <CardTitle titleClassName={classes.title} title={t('TVL-bychain')} />
          <IconButton className={classes.closeIcon} onClick={close} aria-label="settings">
            <CloseIcon htmlColor="#D0D0DA" />
          </IconButton>
        </CardHeader>
        <CardContent className={classes.content}>
          <div className={classes.gridScroller}>
            <div className={classes.grid}>
              {sortedTvls.map(item => (
                <Chain key={item.chainId} chainId={item.chainId} tvl={item.tvl} />
              ))}
            </div>
          </div>
          <Button onClick={close} fullWidth={true} className={classes.closeButton}>
            {t('Close')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

export const ModalTvl = memo<ModalTvlProps>(_ModalTvl);

type ChainProps = { chainId: ChainEntity['id']; tvl: BigNumber };
const Chain = memo<ChainProps>(function Chain({ chainId, tvl }) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <Box className={classes.chain}>
      <img className={classes.chainLogo} alt={chain.id} src={getNetworkSrc(chain.id)} />
      <Box>
        <div className={classes.chainText}>{chain.name}</div>
        <>
          {tvl ? (
            <div className={classes.chainValue}>{formatLargeUsd(tvl)}</div>
          ) : (
            <ContentLoading />
          )}
        </>
      </Box>
    </Box>
  );
});
