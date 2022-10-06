import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import ContentLoader from 'react-content-loader';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import {
  selectBridgeBifiDestChainData,
  selectIsBridgeLoaded,
} from '../../../../../data/selectors/bridge';

const useStyles = makeStyles(styles);

function _FeesInfo() {
  const { t } = useTranslation();
  const classes = useStyles();

  const isBridgeDataLoaded = useAppSelector(selectIsBridgeLoaded);

  const formState = useAppSelector(state => state.ui.bridge);

  const destChain = useAppSelector(state => selectChainById(state, formState.destChainId));

  const destChainData = useAppSelector(state =>
    selectBridgeBifiDestChainData(state, formState.fromChainId, destChain.networkChainId)
  );

  return (
    <div className={classes.fees}>
      {isBridgeDataLoaded && destChainData ? (
        <>
          <div className={classes.feesContent}>
            {/*Crosschain */}
            <Item title={t('Bridge-Crosschain')}>{destChainData.SwapFeeRatePerMillion}%</Item>

            {/*Gas fee */}
            <Item title={t('Bridge-Gas')}> {destChainData.MinimumSwapFee} BIFI</Item>

            {/* Min Amount */}
            <Item title={t('Bridge-MinAmount')}> {destChainData.MinimumSwap} BIFI</Item>

            {/* Max Amount */}
            <Item title={t('Bridge-MaxAmount')}>{destChainData.MaximumSwap} BIFI</Item>
          </div>
          <div className={classes.advice}>
            <p>{t('Bridge-Advice-1')}</p>
            <p>{t('Bridge-Advice-2', { amount: destChainData.BigValueThreshold })}</p>
          </div>
        </>
      ) : (
        <FeesLoader />
      )}
    </div>
  );
}

const Item = ({ title, children }) => {
  const classes = useStyles();
  return (
    <div className={classes.feesItem}>
      <div className={classes.label}>{title}</div>
      <div className={classes.value}>{children}</div>
    </div>
  );
};

const FeesLoader = memo(function () {
  const classes = useStyles();

  return (
    <div className={classes.feesLoader}>
      <ContentLoader
        speed={2}
        viewBox="0 0 328 208"
        backgroundColor="#313759"
        foregroundColor="#8585A"
      >
        <rect x="12" y="12" width="156" height="18" />
        <rect x="12" y="32" width="156" height="22" />
        <rect x="184" y="12" width="156" height="18" />
        <rect x="184" y="32" width="156" height="22" />
        <rect x="12" y="72" width="156" height="38" />
        <rect x="12" y="112" width="156" height="22" />
        <rect x="184" y="72" width="156" height="38" />
        <rect x="184" y="112" width="156" height="22" />
        <rect x="12" y="148" width="328" height="20" />
        <rect x="12" y="180" width="328" height="40" />
      </ContentLoader>
    </div>
  );
});

export const Fees = React.memo(_FeesInfo);
