import { Box, makeStyles, IconButton, Button, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { CardContent } from '../../../../vault/components/Card/CardContent';
import { CardHeader } from '../../../../vault/components/Card/CardHeader';
import { CardTitle } from '../../../../vault/components/Card/CardTitle';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectAllChains } from '../../../../data/selectors/chains';
import { Card } from '../../../../vault/components/Card';
import { ChainEntity } from '../../../../data/entities/chain';
import { selectTvlByChain } from '../../../../data/selectors/tvl';
import BigNumber from 'bignumber.js';
import { formatBigUsd } from '../../../../../helpers/format';
import { ContentLoading } from '../../../../../components/ContentLoading';

const useStyles = makeStyles(styles as any);

function _ModalTvl({ close }: { close: () => void }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const tvls = useSelector(selectTvlByChain);

  const chains = useSelector(selectAllChains);

  return (
    <Box className={classes.modalCard}>
      <Card>
        <CardHeader className={classes.header}>
          <CardTitle titleClassName={classes.title} title={t('TVL-bychain')} />
          <IconButton className={classes.removeHover} onClick={close} aria-label="settings">
            <CloseIcon htmlColor="#8A8EA8" />
          </IconButton>
        </CardHeader>
        <CardContent className={classes.container}>
          <Grid container spacing={2}>
            {chains.map(chain => {
              return (
                <Grid key={chain.id} item xs={6} lg={3}>
                  <Chain chain={chain} tvl={tvls[chain.id]} />
                </Grid>
              );
            })}
          </Grid>
          <Button onClick={close} className={classes.btn}>
            {t('Close')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export const ModalTvl = React.memo(_ModalTvl);

function Chain({ chain, tvl }: { chain: ChainEntity; tvl: BigNumber }) {
  const classes = useStyles();

  return (
    <Box className={classes.chain}>
      <img
        className={classes.chainLogo}
        alt={chain.id}
        src={require(`../../../../../images/networks/${chain.id}.svg`).default}
      />
      <Box>
        <Typography variant="body2" className={classes.chainText}>
          {chain.name}
        </Typography>
        <>
          {tvl ? (
            <Typography variant="body1" className={classes.chainValue}>
              {formatBigUsd(tvl)}
            </Typography>
          ) : (
            <ContentLoading />
          )}
        </>
      </Box>
    </Box>
  );
}
