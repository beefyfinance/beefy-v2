import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../../../../../../components/Step';
import { useTranslation } from 'react-i18next';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectFiat,
  selectIsFiatTokenSupported,
  selectNetworksForFiatToken,
  selectToken,
} from '../../../../../data/selectors/on-ramp';
import { useDispatch } from 'react-redux';
import { SearchableList } from '../../../../../../components/SearchableList';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc';
import clsx from 'clsx';
import { selectChainById } from '../../../../../data/selectors/chains';
import { TokenIconAdornment } from '../TokenTitleAdornment';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';
import type { ChainEntity } from '../../../../../data/entities/chain';

const useStyles = makeStyles(styles);

export const NetworkStep = memo(function NetworkStep() {
  const { t } = useTranslation();
  const fiat = useAppSelector(selectFiat);
  const token = useAppSelector(selectToken);
  const supported = useAppSelector(state => selectIsFiatTokenSupported(state, fiat, token));

  const dispatch = useAppDispatch();

  const handleBack = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectToken }));
  }, [dispatch]);

  return (
    <Step
      stepType="onRamp"
      title={t('OnRamp-NetworkStep-Title')}
      onBack={handleBack}
      titleAdornment={supported ? <TokenIconAdornment token={token} /> : undefined}
    >
      {supported ? (
        <NetworkSelector fiat={fiat} token={token} />
      ) : (
        <TokenNotSupported fiat={fiat} token={token} />
      )}
    </Step>
  );
});

const TokenNotSupported = memo<{ fiat: string; token: string }>(function TokenNotSupported({
  fiat,
  token,
}) {
  return (
    <div>
      {token} not supported for {fiat}
    </div>
  );
});

type NetworkIconPlaceholderProps = {
  network: string;
  className?: string;
};
const NetworkIconPlaceholder = memo<NetworkIconPlaceholderProps>(function NetworkIconPlaceholder({
  network,
  className,
}) {
  return <div className={className} data-network={network} />;
});

const NetworkListItem = memo<{ value: ChainEntity['id'] }>(function NetworkListItem({ value }) {
  const classes = useStyles();
  const src = getNetworkSrc(value);
  const chain = useAppSelector(state => selectChainById(state, value));

  return (
    <>
      {src ? (
        <img src={src} alt="" width="24" height="24" className={classes.listItemIcon} />
      ) : (
        <NetworkIconPlaceholder
          network={value}
          className={clsx(classes.listItemIcon, classes.listItemIconPlaceholder)}
        />
      )}
      {chain.name}
    </>
  );
});

const NetworkSelector = memo<{ fiat: string; token: string }>(function NetworkSelector({
  fiat,
  token,
}) {
  const networks = useAppSelector(state => selectNetworksForFiatToken(state, fiat, token));
  const sortedNetworks = useMemo(() => [...networks].sort(), [networks]);
  const dispatch = useDispatch();

  const handleSelect = useCallback(
    (network: ChainEntity['id']) => {
      dispatch(onRampFormActions.selectNetwork({ network }));
    },
    [dispatch]
  );

  return (
    <>
      <SearchableList
        options={sortedNetworks}
        onSelect={handleSelect}
        ItemInnerComponent={NetworkListItem}
      />
    </>
  );
});
