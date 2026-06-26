import type BigNumber from 'bignumber.js';
import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { selectChainById } from '../../../../../features/data/selectors/chains.ts';
import {
  selectCrossChainDstDust,
  selectCrossChainDstReceived,
  selectCrossChainSrcReturned,
  selectStepperBridgeStatus,
  selectZapReturned,
} from '../../../../../features/data/selectors/stepper.ts';
import { selectVaultById } from '../../../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { formatTokenDisplayCondensed } from '../../../../../helpers/format.ts';
import { ChainGroupedTokens } from '../common/ChainGroupedTokens.tsx';
import { formatTokenAmountsList } from '../common/formatTokenAmountsList.tsx';
import { SuccessContentDisplay } from './SuccessContentDisplay.tsx';
import type { SuccessContentProps } from './types.ts';

export const ZapSuccessContent = memo(function ZapSuccessContent({ step }: SuccessContentProps) {
  const { t } = useTranslation();
  const returned = useAppSelector(selectZapReturned);
  const srcReturned = useAppSelector(selectCrossChainSrcReturned);
  const bridgeStatus = useAppSelector(selectStepperBridgeStatus);
  const pendingOp = useAppSelector(state =>
    bridgeStatus?.opId ? state.ui.transact.crossChain.pendingOps[bridgeStatus.opId] : undefined
  );
  const vault = useAppSelector(state =>
    pendingOp?.vaultId ? selectVaultById(state, pendingOp.vaultId) : undefined
  );
  const srcChain = useAppSelector(state =>
    pendingOp?.sourceChainId ? selectChainById(state, pendingOp.sourceChainId) : undefined
  );
  const destChain = useAppSelector(state =>
    pendingOp?.destChainId ? selectChainById(state, pendingOp.destChainId) : undefined
  );
  const dstReceived = useAppSelector(selectCrossChainDstReceived);
  const dstDust = useAppSelector(selectCrossChainDstDust);

  const isCrossChain = !!pendingOp && !!vault && !!srcChain && !!destChain;

  const dust = useMemo(() => {
    if (!isCrossChain) {
      if (returned.length) {
        return { element: formatTokenAmountsList(returned), isSingle: returned.length === 1 };
      }
      return undefined;
    }

    const allDust: {
      amount: BigNumber;
      token: { decimals: number; symbol: string };
      chainName: string;
    }[] = [];
    for (const item of srcReturned) {
      allDust.push({ ...item, chainName: srcChain.name });
    }
    for (const item of dstDust) {
      allDust.push({ ...item, chainName: destChain.name });
    }
    if (allDust.length) {
      return { element: <ChainGroupedTokens items={allDust} />, isSingle: allDust.length === 1 };
    }
    return undefined;
  }, [isCrossChain, returned, dstDust, srcReturned, srcChain, destChain]);

  const title = useMemo(() => {
    if (isCrossChain) {
      return pendingOp.direction === 'withdraw' ?
          t('Stepper-CrossChain-Withdraw-Success-Title')
        : t('Stepper-CrossChain-Deposit-Success-Title');
    }
    return t(`Stepper-${step.step}-Success-Title`);
  }, [isCrossChain, pendingOp, step.step, t]);

  const receivedLine = useMemo(() => {
    if (isCrossChain && dstReceived.length) {
      let displayItems;
      if (pendingOp.direction === 'deposit' && vault.assetType !== 'single') {
        displayItems = dstReceived.map(item => ({
          ...item,
          token: { ...item.token, symbol: 'LP' },
        }));
      } else if (pendingOp.direction === 'withdraw') {
        const outputSymbol = pendingOp.expectedOutput.token.symbol;
        displayItems = dstReceived.map(item => ({
          ...item,
          token: { ...item.token, symbol: outputSymbol },
        }));
      } else {
        displayItems = dstReceived;
      }
      const received = formatTokenAmountsList(displayItems);
      return (
        <Trans
          t={t}
          i18nKey={
            pendingOp.direction === 'withdraw' ?
              'Stepper-CrossChain-Withdraw-Received'
            : 'Stepper-CrossChain-Deposit-Received'
          }
          components={{ received }}
        />
      );
    }
    return undefined;
  }, [isCrossChain, dstReceived, pendingOp, vault, t]);

  const dustLine = useMemo(() => {
    if (dust) {
      return (
        <Trans
          t={t}
          i18nKey={dust.isSingle ? 'Stepper-Dust-Single' : 'Stepper-Dust'}
          components={{ dust: dust.element }}
        />
      );
    }
    return undefined;
  }, [dust, t]);

  const message = useMemo(() => {
    if (isCrossChain) {
      const { sourceInput, expectedOutput } = pendingOp;
      const inputAmount = formatTokenDisplayCondensed(
        sourceInput.amount,
        sourceInput.token.decimals
      );
      const vaultChain = pendingOp.direction === 'deposit' ? destChain : srcChain;

      const mainText =
        pendingOp.direction === 'withdraw' ?
          t('Stepper-CrossChain-Withdraw-Success-Content', {
            amount: inputAmount,
            token: sourceInput.token.symbol,
            vaultName: vault.names.singleMeta,
            vaultChain: vaultChain.name,
            outputToken: expectedOutput.token.symbol,
            destChain: destChain.name,
          })
        : t('Stepper-CrossChain-Deposit-Success-Content', {
            amount: inputAmount,
            token: sourceInput.token.symbol,
            srcChain: srcChain.name,
            vaultName: vault.names.singleMeta,
            vaultChain: vaultChain.name,
          });

      const hasExtra = receivedLine || dustLine;
      return (
        <>
          <div>{mainText}</div>
          {hasExtra ?
            <div style={{ marginTop: '12px' }}>
              {receivedLine}
              {receivedLine && dustLine ? ' ' : null}
              {dustLine}
            </div>
          : null}
        </>
      );
    }
    return t(`Stepper-${step.step}-Success-Content`);
  }, [isCrossChain, pendingOp, vault, srcChain, destChain, step.step, t, receivedLine, dustLine]);

  const messageHighlight = useMemo(() => {
    if (!isCrossChain && dust) {
      return (
        <Trans
          t={t}
          i18nKey={dust.isSingle ? 'Stepper-Dust-Single' : 'Stepper-Dust'}
          components={{ dust: dust.element }}
        />
      );
    }
    return undefined;
  }, [isCrossChain, dust, t]);

  const isDeposit = isCrossChain ? pendingOp.direction === 'deposit' : step.step === 'zap-in';

  return (
    <SuccessContentDisplay
      title={title}
      message={message}
      messageHighlight={messageHighlight}
      rememberTitle={isDeposit ? t('Remember') : undefined}
      rememberMessage={isDeposit ? t('Remember-Msg') : undefined}
      shareVaultId={isDeposit ? step.extraInfo?.vaultId || pendingOp?.vaultId : undefined}
    />
  );
});
