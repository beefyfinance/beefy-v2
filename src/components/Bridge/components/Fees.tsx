import React from 'react';
import { makeStyles, Box, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import { BeefyState } from '../../../redux-types';
import { useSelector } from 'react-redux';
import { isFulfilled } from '../../../features/data/reducers/data-loader';
import ContentLoader from 'react-content-loader';
import { selectChainById } from '../../../features/data/selectors/chains';
import { DestChainEntity } from '../../../features/data/apis/bridge/bridge-types';

const useStyles = makeStyles(styles);

function _FeesInfo() {
  const { t } = useTranslation();
  const classes = useStyles();

  const isBridgeDataLoaded = useSelector((state: BeefyState) =>
    isFulfilled(state.ui.dataLoader.global.bridgeForm)
  );

  const formState = useSelector((state: BeefyState) => state.ui.bridgeModal);

  const destChain = useSelector((state: BeefyState) =>
    selectChainById(state, formState.destChainId)
  );

  const destChainData: DestChainEntity = Object.values(
    formState.destChainInfo.destChains[destChain.networkChainId]
  )[0];

  return (
    <Box className={classes.fees}>
      {isBridgeDataLoaded ? (
        <>
          <Box className={classes.feesContent}>
            {/*Crosschain */}
            <Box className={classes.feesItem}>
              <Typography className={classes.label} variant="body2">
                {t('Bridge-Crosschain')}
              </Typography>
              <Typography className={classes.value} variant="h5">
                {destChainData.SwapFeeRatePerMillion}%
              </Typography>
            </Box>
            {/*Gas fee */}
            <Box className={classes.feesItem}>
              <Typography className={classes.label} variant="body2">
                {t('Bridge-Gas')}
              </Typography>
              <Typography className={classes.value} variant="h5">
                {destChainData.MinimumSwapFee} BIFI
              </Typography>
            </Box>
            {/* Min Amount */}
            <Box className={classes.feesItem}>
              <Typography className={classes.label} variant="body2">
                {t('Bridge-MinAmount')}
              </Typography>
              <Typography className={classes.value} variant="h5">
                {destChainData.MinimumSwap} BIFI
              </Typography>
            </Box>
            {/* Max Amount */}
            <Box className={classes.feesItem}>
              <Typography className={classes.label} variant="body2">
                {t('Bridge-MaxAmount')}
              </Typography>
              <Typography className={classes.value} variant="h5">
                {destChainData.MaximumSwap} BIFI
              </Typography>
            </Box>
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
