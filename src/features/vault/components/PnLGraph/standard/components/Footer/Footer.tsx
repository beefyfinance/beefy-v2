import { memo, useCallback, useMemo } from 'react';
import type { VaultEntity } from '../../../../../../data/entities/vault.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { ToggleButtons } from '../../../../../../../components/ToggleButtons/ToggleButtons.tsx';

interface FooterProps {
  period: number;
  handlePeriod: (period: number) => void;
  vaultId: VaultEntity['id'];
  labels: string[];
  css?: CssStyles;
}

export const Footer = memo(function Footer({
  period,
  handlePeriod,
  labels,
  css: cssProp,
}: FooterProps) {
  const options = useMemo(
    () => labels.map((label, index) => ({ value: index.toString(), label })),
    [labels]
  );
  const handleChange = useCallback(
    (newValue: string) => {
      handlePeriod(Number(newValue));
    },
    [handlePeriod]
  );

  return (
    <div className={css(styles.footer, cssProp)}>
      <ToggleButtons
        value={period.toString()}
        options={options}
        onChange={handleChange}
        noBackground={true}
        noPadding={true}
        noBorder={true}
        variant="range"
      />
    </div>
  );
});
