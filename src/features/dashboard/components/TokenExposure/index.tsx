import React, { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectUserTokenExposure } from '../../../data/selectors/balance';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';

interface TokenExposureProps {
  title?: string;
}

const TokenExposure = memo<TokenExposureProps>(function ({ title }) {
  const tokensExposureData = useAppSelector(state => selectUserTokenExposure(state));

  return <ExposureChart title={title} type="token" data={tokensExposureData} />;
});

export const TokenExposureLoader = memo<TokenExposureProps>(function ({ title }) {
  const isUserDataAvailable = useAppSelector(selectIsUserBalanceAvailable);

  if (isUserDataAvailable) {
    return <TokenExposure title={title} />;
  }

  return null;
});
