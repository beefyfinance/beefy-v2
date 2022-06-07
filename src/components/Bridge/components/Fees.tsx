import React from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { isFulfilled } from '../../../features/data/reducers/data-loader';
import ContentLoader from 'react-content-loader';
import { selectChainById } from '../../../features/data/selectors/chains';
import { selectBridgeBifiDestChainData } from '../../../features/data/selectors/bridge';
import { useAppSelector } from '../../../store';

const useStyles = makeStyles(styles);

function _FeesInfo() {
  const { t } = useTranslation();
  const classes = useStyles();

  const isBridgeDataLoaded = useAppSelector(state =>
    isFulfilled(state.ui.dataLoader.global.bridgeForm)
  );

  const formState = useAppSelector(state => state.ui.bridgeModal);

  const destChain = useAppSelector(state => selectChainById(state, formState.destChainId));

  const destChainData = useAppSelector(state =>
    selectBridgeBifiDestChainData(state, formState.fromChainId, destChain.networkChainId)
  );

  return (
    <Box className={classes.fees}>
      {isBridgeDataLoaded && destChainData ? (
        <>
          <Box className={classes.feesContent}>
            {/*Crosschain */}

            <Item title={t('Bridge-Crosschain')}>{destChainData.SwapFeeRatePerMillion}%</Item>

            {/*Gas fee */}

            <Item title={t('Bridge-Gas')}> {destChainData.MinimumSwapFee} BIFI</Item>

            {/* Min Amount */}

            <Item title={t('Bridge-MinAmount')}> {destChainData.MinimumSwap} BIFI</Item>

            {/* Max Amount */}

            <Item title={t('Bridge-MaxAmount')}>{destChainData.MaximumSwap} BIFI</Item>
          </Box>
          <Typography variant="body2" className={classes.advice}>
            {t('Bridge-Advice-1')}
          </Typography>
          <Typography variant="body2" className={classes.advice1}>
            {t('Bridge-Advice-2')}
          </Typography>
        </>
      ) : (
        <Loader />
      )}
    </Box>
  );
}

const Item = ({ title, children }) => {
  const classes = useStyles();
  return (
    <Box className={classes.feesItem}>
      <Typography className={classes.label} variant="body2">
        {title}
      </Typography>
      <Typography className={classes.value} variant="h5">
        {children}
      </Typography>
    </Box>
  );
};

const Loader = props => (
  <ContentLoader
    speed={2}
    width={476}
    height={180}
    viewBox="0 0 476 180"
    backgroundColor="#313759"
    foregroundColor="#8585A"
    {...props}
  >
    <rect x="11" y="21" rx="3" ry="3" width="88" height="6" />
    <rect x="11" y="39" rx="3" ry="3" width="52" height="6" />
    <rect x="2" y="140" rx="3" ry="3" width="289" height="5" />
    <rect x="198" y="21" rx="3" ry="3" width="88" height="6" />
    <rect x="198" y="39" rx="3" ry="3" width="52" height="6" />
    <rect x="11" y="78" rx="3" ry="3" width="88" height="6" />
    <rect x="11" y="96" rx="3" ry="3" width="52" height="6" />
    <rect x="198" y="78" rx="3" ry="3" width="88" height="6" />
    <rect x="198" y="96" rx="3" ry="3" width="52" height="6" />
    <rect x="2" y="156" rx="3" ry="3" width="289" height="5" />
    <rect x="2" y="172" rx="3" ry="3" width="289" height="5" />
  </ContentLoader>
);

export const Fees = React.memo(_FeesInfo);
