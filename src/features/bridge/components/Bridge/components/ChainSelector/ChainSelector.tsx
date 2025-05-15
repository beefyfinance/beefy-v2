import { css, type CssStyles, cx } from '@repo/styles/css';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { FormStep } from '../../../../../data/reducers/wallet/bridge-types.ts';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge.ts';
import { selectBridgeFormState } from '../../../../../data/selectors/bridge.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type ChainButtonProps = {
  chainId: ChainEntity['id'];
  step: FormStep;
  css?: CssStyles;
};

const ChainButton = memo(function ChainButton({ chainId, step, css: cssProp }: ChainButtonProps) {
  const dispatch = useAppDispatch();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const handleClick = useCallback(() => {
    dispatch(bridgeActions.setStep({ step }));
  }, [dispatch, step]);

  return (
    <button type="button" className={css(styles.btn, styles.chain, cssProp)} onClick={handleClick}>
      <ChainIcon chainId={chainId} css={styles.icon} />
      {chain.name}
    </button>
  );
});

const ArrowButton = memo(function ArrowButton() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(bridgeActions.reverseDirection());
  }, [dispatch]);

  return (
    <button type="button" className={css(styles.btn, styles.arrowButton)} onClick={handleClick}>
      <div className={cx('arrow-button-arrow', classes.arrow)}>
        <div className={classes.arrowInner} />
      </div>
    </button>
  );
});

export type ChainSelectorProps = {
  css?: CssStyles;
};

export const ChainSelector = memo(function ChainSelector({ css: cssProp }: ChainSelectorProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { from, to } = useAppSelector(selectBridgeFormState);

  return (
    <div className={css(cssProp)}>
      <div className={classes.labels}>
        <div className={classes.label}>{t('FROM')}</div>
        <div className={classes.label}>{t('TO')}</div>
      </div>
      <div className={classes.buttons}>
        <ChainButton css={styles.from} chainId={from} step={FormStep.SelectFromNetwork} />
        <ArrowButton />
        <ChainButton css={styles.to} chainId={to} step={FormStep.SelectToNetwork} />
      </div>
    </div>
  );
});
