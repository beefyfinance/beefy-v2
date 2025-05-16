import { css, type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  selectFilteredVaultCount,
  selectTotalVaultCount,
} from '../../../../../data/selectors/filtered-vaults.ts';

export type ShownVaultsCountProps = {
  css?: CssStyles;
};

export const ShownVaultsCount = memo(function ShownVaultsCount({
  css: cssProp,
}: ShownVaultsCountProps) {
  const { t } = useTranslation();
  const filteredVaultCount = useAppSelector(selectFilteredVaultCount);
  const totalVaultCount = useAppSelector(selectTotalVaultCount);

  return (
    <div className={css(cssProp)}>
      {t('Filter-ShowingVaults', {
        number: filteredVaultCount,
        count: totalVaultCount,
      })}
    </div>
  );
});
