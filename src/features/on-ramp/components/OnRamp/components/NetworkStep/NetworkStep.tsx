import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../Step';
import { useTranslation } from 'react-i18next';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { useAppSelector } from '../../../../../../store';
import {
  selectFiat,
  selectIsFiatTokenSupported,
  selectNetworksForFiatToken,
  selectToken,
} from '../../../../../data/selectors/on-ramp';
import { useDispatch } from 'react-redux';
import { SearchableList } from '../SearchableList';
import { ItemInnerProps } from '../SearchableList/ItemInner';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc';
import clsx from 'clsx';
import { selectChainById } from '../../../../../data/selectors/chains';
import { TokenIconAdornment } from '../TokenTitleAdornment';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';

const useStyles = makeStyles(styles);

export const NetworkStep = memo(function () {
  const { t } = useTranslation();
  const fiat = useAppSelector(selectFiat);
  const token = useAppSelector(selectToken);
  const supported = useAppSelector(state => selectIsFiatTokenSupported(state, fiat, token));

  return (
    <Step
      title={t('OnRamp-NetworkStep-Title')}
      backStep={FormStep.SelectToken}
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

const TokenNotSupported = memo<{ fiat: string; token: string }>(function ({ fiat, token }) {
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
const NetworkIconPlaceholder = memo<NetworkIconPlaceholderProps>(function ({ network, className }) {
  return <div className={className} data-network={network} />;
});

const ListItem = memo<ItemInnerProps>(function ({ value }) {
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

const NetworkSelector = memo<{ fiat: string; token: string }>(function ({ fiat, token }) {
  const networks = useAppSelector(state => selectNetworksForFiatToken(state, fiat, token));
  const sortedNetworks = useMemo(() => [...networks].sort(), [networks]);
  const dispatch = useDispatch();

  const handleSelect = useCallback(
    (network: string) => {
      dispatch(onRampFormActions.selectNetwork({ network }));
    },
    [dispatch]
  );

  return (
    <>
      <SearchableList
        options={sortedNetworks}
        onSelect={handleSelect}
        ItemInnerComponent={ListItem}
      />
    </>
  );
});
