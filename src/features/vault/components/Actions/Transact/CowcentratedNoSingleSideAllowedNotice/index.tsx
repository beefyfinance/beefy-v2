import React, { memo, useEffect } from 'react';
import { AlertWarning } from '../../../../../../components/Alerts';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import { selectTransactCowcentratedDepositNotSingleSideAllowed } from '../../../../../data/selectors/transact';

interface CowcentratedNoSingleSideAllowedNoticeProps {
  onChange: (shouldDisable: boolean) => void;
}

export const CowcentratedNoSingleSideAllowedNotice =
  memo<CowcentratedNoSingleSideAllowedNoticeProps>(function CowcentratedNoSingleSideAllowedNotice({
    onChange,
  }) {
    const { t } = useTranslation();
    const { noSingleSideAllowed, inputToken, neededToken } = useAppSelector(
      selectTransactCowcentratedDepositNotSingleSideAllowed
    );

    useEffect(() => {
      onChange(noSingleSideAllowed);
    }, [noSingleSideAllowed, onChange]);

    if (!noSingleSideAllowed) {
      return null;
    }

    return (
      <AlertWarning>
        {t('Transact-Notice-CowcentratedNoSingleSideAllowed', {
          inputToken: inputToken?.token.symbol,
          neededToken: neededToken?.token.symbol,
        })}
      </AlertWarning>
    );
  });
