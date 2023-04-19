import { Box, IconButton, makeStyles } from '@material-ui/core';
import React, { forwardRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../vault/components/Card';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { selectActiveChainIds, selectChainById } from '../../../../data/selectors/chains';
import type { ChainEntity } from '../../../../data/entities/chain';
import { selectTvlByChain } from '../../../../data/selectors/tvl';
import type BigNumber from 'bignumber.js';
import { formatBigUsd } from '../../../../../helpers/format';
import { ContentLoading } from '../../../../../components/ContentLoading';
import { Button } from '../../../../../components/Button';
import { useAppSelector } from '../../../../../store';
import { orderBy } from 'lodash-es';
import { getNetworkSrc } from '../../../../../helpers/networkSrc';

const useStyles = makeStyles(styles);

export type ModalTvlProps = {
  close: () => void;
};

interface ItemListType {
  chainId: ChainEntity['id'];
  tvl: number;
}

const _ModalTvl = forwardRef<HTMLDivElement, ModalTvlProps>(function ModalTvl({ close }, ref) {
  const classes = useStyles();
  const { t } = useTranslation();
  const tvls = useAppSelector(selectTvlByChain);
  const activeChainIds = useAppSelector(selectActiveChainIds);

  const sortedTvls = React.useMemo<ItemListType[]>(() => {
    const list = [];
    for (const [chainId, tvl] of Object.entries(tvls)) {
      if (!activeChainIds.includes(chainId)) continue;
      list.push({ tvl: tvl.toNumber(), chainId });
    }
    return orderBy(list, 'tvl', 'desc');
  }, [tvls, activeChainIds]);

  return (
    <div className={classes.holder} ref={ref} tabIndex={-1}>
      <Card className={classes.card}>
        <CardHeader className={classes.header}>
          <CardTitle titleClassName={classes.title} title={t('TVL-bychain')} />
          <IconButton className={classes.closeIcon} onClick={close} aria-label="settings">
            <CloseIcon htmlColor="#8A8EA8" />
          </IconButton>
        </CardHeader>
        <CardContent className={classes.content}>
          <div className={classes.gridScroller}>
            <div className={classes.grid}>
              {sortedTvls.map((item: ItemListType) => (
                <Chain key={item.chainId} chainId={item.chainId} tvl={tvls[item.chainId]} />
              ))}
            </div>
          </div>
          <Button
            onClick={close}
            variant="success"
            fullWidth={true}
            className={classes.closeButton}
          >
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
          {tvl ? <div className={classes.chainValue}>{formatBigUsd(tvl)}</div> : <ContentLoading />}
        </>
      </Box>
    </Box>
  );
});
