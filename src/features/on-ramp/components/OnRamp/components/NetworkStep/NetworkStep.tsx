import { css, type CssStyles } from '@repo/styles/css';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { SearchableList } from '../../../../../../components/SearchableList/SearchableList.tsx';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { getNetworkSrc } from '../../../../../../helpers/networkSrc.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import {
  selectFiat,
  selectIsFiatTokenSupported,
  selectNetworksForFiatToken,
  selectToken,
} from '../../../../../data/selectors/on-ramp.ts';
import { TokenIconAdornment } from '../TokenTitleAdornment/TokenIconAdornment.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

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
      noPadding={supported}
    >
      {supported ?
        <NetworkSelector fiat={fiat} token={token} />
      : <TokenNotSupported fiat={fiat} token={token} />}
    </Step>
  );
});

const TokenNotSupported = memo(function TokenNotSupported({
  fiat,
  token,
}: {
  fiat: string;
  token: string;
}) {
  return (
    <div>
      {token} not supported for {fiat}
    </div>
  );
});

type NetworkIconPlaceholderProps = {
  network: string;
  css?: CssStyles;
};
const NetworkIconPlaceholder = memo(function NetworkIconPlaceholder({
  network,
  css: cssProp,
}: NetworkIconPlaceholderProps) {
  return <div className={css(cssProp)} data-network={network} />;
});

const NetworkListItem = memo(function NetworkListItem({ value }: { value: ChainEntity['id'] }) {
  const classes = useStyles();
  const src = getNetworkSrc(value);
  const chain = useAppSelector(state => selectChainById(state, value));

  return (
    <>
      {src ?
        <img src={src} alt="" width="24" height="24" className={classes.listItemIcon} />
      : <NetworkIconPlaceholder
          network={value}
          css={css.raw(styles.listItemIcon, styles.listItemIconPlaceholder)}
        />
      }
      {chain.name}
    </>
  );
});

const NetworkSelector = memo(function NetworkSelector({
  fiat,
  token,
}: {
  fiat: string;
  token: string;
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
