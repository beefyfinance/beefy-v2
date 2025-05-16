import { css, type CssStyles } from '@repo/styles/css';
import { memo, useCallback } from 'react';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { FormStep } from '../../../../../data/reducers/on-ramp-types.ts';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { styles } from './styles.ts';

export type TokenIconAdornmentProps = {
  token: string;
  css?: CssStyles;
};
export const TokenIconAdornment = memo(function TokenIconAdornment({
  token,
  css: cssProp,
}: TokenIconAdornmentProps) {
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectToken }));
  }, [dispatch]);

  return (
    <button type="button" className={css(styles.tokenAdornment, cssProp)} onClick={handleClick}>
      <AssetsImage chainId={undefined} assetSymbols={[token]} size={24} css={styles.icon} />
      {token}
    </button>
  );
});
