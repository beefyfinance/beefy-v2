import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import type { ItemInnerProps } from '../../../../../../components/SearchableList/Item.tsx';
import { SearchableList } from '../../../../../../components/SearchableList/SearchableList.tsx';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { setOnRampToken } from '../../../../../data/actions/on-ramp.ts';
import {
  selectFiat,
  selectIsFiatSupported,
  selectSupportedTokensForFiat,
} from '../../../../../data/selectors/on-ramp.ts';
import { FiatTitleAdornment } from '../FiatTitleAdornment/FiatTitleAdornment.tsx';
import { styles } from './styles.ts';

export const TokenStep = memo(function TokenStep() {
  const { t } = useTranslation();
  const fiat = useAppSelector(selectFiat);
  const supported = useAppSelector(state => selectIsFiatSupported(state, fiat));

  return (
    <Step
      stepType="onRamp"
      title={t('OnRamp-TokenStep-Title')}
      titleAdornment={supported ? <FiatTitleAdornment currencyCode={fiat} /> : undefined}
      noPadding={supported}
    >
      {supported ?
        <TokenSelector fiat={fiat} />
      : <FiatNotSupported fiat={fiat} />}
    </Step>
  );
});

const FiatNotSupported = memo(function FiatNotSupported({ fiat }: { fiat: string }) {
  return <div>{fiat} not supported</div>;
});

const ListItem = memo(function ListItem({ value }: ItemInnerProps) {
  const assetIds = useMemo(() => [value], [value]);
  return (
    <>
      <AssetsImage
        chainId={undefined}
        assetSymbols={assetIds}
        size={24}
        css={styles.listItemIcon}
      />
      {value}
    </>
  );
});

const TokenSelector = memo(function TokenSelector({ fiat }: { fiat: string }) {
  const tokens = useAppSelector(state => selectSupportedTokensForFiat(state, fiat));
  const sortedTokens = useMemo(() => [...tokens].sort((a, b) => a.localeCompare(b)), [tokens]);

  const dispatch = useAppDispatch();

  const handleSelect = useCallback(
    (token: string) => {
      dispatch(setOnRampToken({ token }));
    },
    [dispatch]
  );

  return (
    <>
      <SearchableList
        options={sortedTokens}
        onSelect={handleSelect}
        ItemInnerComponent={ListItem}
      />
    </>
  );
});
