import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Step } from '../../../../../../components/Step';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectFiat,
  selectIsFiatSupported,
  selectSupportedTokensForFiat,
} from '../../../../../data/selectors/on-ramp';
import { SearchableList } from '../../../../../../components/SearchableList';
import { ItemInnerProps } from '../../../../../../components/SearchableList/ItemInner';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { FiatTitleAdornment } from '../FiatTitleAdornment';
import { setOnRampToken } from '../../../../../data/actions/on-ramp';

const useStyles = makeStyles(styles);

export const TokenStep = memo(function () {
  const { t } = useTranslation();
  const fiat = useAppSelector(selectFiat);
  const supported = useAppSelector(state => selectIsFiatSupported(state, fiat));

  return (
    <Step
      stepType="onRamp"
      title={t('OnRamp-TokenStep-Title')}
      titleAdornment={supported ? <FiatTitleAdornment currencyCode={fiat} /> : undefined}
    >
      {supported ? <TokenSelector fiat={fiat} /> : <FiatNotSupported fiat={fiat} />}
    </Step>
  );
});

const FiatNotSupported = memo<{ fiat: string }>(function ({ fiat }) {
  return <div>{fiat} not supported</div>;
});

const ListItem = memo<ItemInnerProps>(function ({ value }) {
  const classes = useStyles();
  const assetIds = useMemo(() => [value], [value]);
  return (
    <>
      <AssetsImage
        chainId={undefined}
        assetIds={assetIds}
        size={24}
        className={classes.listItemIcon}
      />
      {value}
    </>
  );
});

const TokenSelector = memo<{ fiat: string }>(function ({ fiat }) {
  const tokens = useAppSelector(state => selectSupportedTokensForFiat(state, fiat));
  const sortedTokens = useMemo(() => [...tokens].sort(), [tokens]);
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
