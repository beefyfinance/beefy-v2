import { css, type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../../../components/LinkButton/LinkButton.tsx';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  selectTransactNumTokens,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';

export type DepositBuyLinksProps = {
  css?: CssStyles;
};
export const DepositBuyLinks = memo(function DepositBuyLinks({
  css: cssProp,
}: DepositBuyLinksProps) {
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const numTokenOptions = useAppSelector(selectTransactNumTokens);

  const showLinks = vault.addLiquidityUrl && numTokenOptions === 1;

  if (!showLinks) {
    return null;
  }

  return (
    <div className={css(styles.btnContainer, cssProp)}>
      {vault.addLiquidityUrl && (
        <LinkButton href={vault.addLiquidityUrl} text={t('Transact-BuildLp')} />
      )}
    </div>
  );
});
