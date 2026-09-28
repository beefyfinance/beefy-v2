import type BigNumber from 'bignumber.js';
import { memo, type ReactNode, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { TokenAmount } from '../../../../../features/data/apis/transact/transact-types.ts';
import type { VaultEntity } from '../../../../../features/data/entities/vault.ts';
import type { ZapStepDetails } from '../../../../../features/data/reducers/wallet/stepper-types.ts';
import { selectChainById } from '../../../../../features/data/selectors/chains.ts';
import {
  selectCrossChainDstDust,
  selectCrossChainDstReceived,
  selectCrossChainSrcReturned,
  selectStepperBridgeStatus,
  selectZapReceived,
  selectZapReturned,
} from '../../../../../features/data/selectors/stepper.ts';
import { selectVaultById } from '../../../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { tokenAmountsEqual } from '../../../../../features/data/utils/selector-equality.ts';
import { formatTokenDisplayCondensed } from '../../../../../helpers/format.ts';
import { ListJoin } from '../../../../ListJoin.tsx';
import { ChainGroupedTokens } from '../common/ChainGroupedTokens.tsx';
import { formatTokenAmountsList } from '../common/formatTokenAmountsList.tsx';
import { SuccessContentDisplay } from './SuccessContentDisplay.tsx';
import type { SuccessContentProps } from './types.ts';

export const ZapSuccessContent = memo(function ZapSuccessContent({ step }: SuccessContentProps) {
  const vaultId = step.extraInfo?.vaultId;
  const zapDetails = step.extraInfo?.zapDetails;
  if (vaultId && zapDetails) {
    return <SameChainZapSuccessContent step={step} vaultId={vaultId} details={zapDetails} />;
  }
  return <CrossChainZapSuccessContent step={step} />;
});

type SameChainZapSuccessContentProps = SuccessContentProps & {
  vaultId: VaultEntity['id'];
  details: ZapStepDetails;
};

const SameChainZapSuccessContent = memo(function SameChainZapSuccessContent({
  step,
  vaultId,
  details,
}: SameChainZapSuccessContentProps) {
  const { t } = useTranslation();
  const { inputs, outputTokens, vaultToVault } = details;
  const isDeposit = step.step === 'zap-in';
  // the vault the zap ends in, whose shares the user receives
  const sharesVaultId =
    vaultToVault ? vaultToVault.destVaultId
    : isDeposit ? vaultId
    : undefined;
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const srcVault = useAppSelector(state =>
    vaultToVault ? selectVaultById(state, vaultToVault.srcVaultId) : undefined
  );
  const sharesVault = useAppSelector(state =>
    sharesVaultId ? selectVaultById(state, sharesVaultId) : undefined
  );
  const received = useAppSelector(
    state => selectZapReceived(state, sharesVaultId),
    tokenAmountsEqual
  );
  const returned = useAppSelector(selectZapReturned, tokenAmountsEqual);

  const mainText = useMemo(() => {
    if (srcVault && sharesVault) {
      return (
        <Trans
          t={t}
          i18nKey="Stepper-Zap-VaultToVault-Success-Content"
          values={{
            srcVaultName: srcVault.names.singleMeta,
            destVaultName: sharesVault.names.singleMeta,
            chain: chain.name,
          }}
          components={{ input: formatTokenAmountsList(withLpSymbol(inputs, srcVault)) }}
        />
      );
    }

    const input = formatTokenAmountsList(withLpSymbol(inputs, vault));
    const values = { vaultName: vault.names.singleMeta, chain: chain.name };
    if (isDeposit) {
      return (
        <Trans
          t={t}
          i18nKey="Stepper-Zap-Deposit-Success-Content"
          values={values}
          components={{ input }}
        />
      );
    }
    return (
      <Trans
        t={t}
        i18nKey="Stepper-Zap-Withdraw-Success-Content"
        values={values}
        components={{
          input,
          output: <ListJoin items={outputTokens.map(token => token.symbol)} />,
        }}
      />
    );
  }, [srcVault, sharesVault, inputs, outputTokens, vault, chain, isDeposit, t]);

  const receivedLine = useMemo(() => {
    if (!received.length) {
      return undefined;
    }
    return (
      <Trans
        t={t}
        i18nKey={
          sharesVault ? 'Stepper-Zap-Deposit-Received'
          : received.length === 1 ?
            'Stepper-Zap-Withdraw-Received'
          : 'Stepper-Zap-Withdraw-Received-Multi'
        }
        components={{ received: formatTokenAmountsList(withLpSymbol(received, sharesVault)) }}
      />
    );
  }, [received, sharesVault, t]);

  const dustLine = useMemo(() => {
    if (!returned.length) {
      return undefined;
    }
    return (
      <Trans
        t={t}
        i18nKey={returned.length === 1 ? 'Stepper-Dust-Single' : 'Stepper-Dust'}
        components={{ dust: formatTokenAmountsList(returned) }}
      />
    );
  }, [returned, t]);

  const message = useMemo(
    () => <ZapSuccessMessage main={mainText} received={receivedLine} dust={dustLine} />,
    [mainText, receivedLine, dustLine]
  );

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={message}
      rememberTitle={isDeposit ? t('Remember') : undefined}
      rememberMessage={isDeposit ? t('Remember-Msg') : undefined}
      shareVaultId={isDeposit ? vaultId : undefined}
    />
  );
});

/** Multi-asset deposit tokens read as LP, as in the transact form */
function withLpSymbol(items: TokenAmount[], vault: VaultEntity | undefined) {
  if (!vault || vault.assetType === 'single') {
    return items;
  }
  const lpAddress = vault.depositTokenAddress.toLowerCase();
  return items.map(item =>
    item.token.address.toLowerCase() === lpAddress ?
      { ...item, token: { ...item.token, symbol: 'LP' } }
    : item
  );
}

type ZapSuccessMessageProps = {
  main: ReactNode;
  received?: ReactNode;
  dust?: ReactNode;
};

function ZapSuccessMessage({ main, received, dust }: ZapSuccessMessageProps) {
  return (
    <>
      <div>{main}</div>
      {received || dust ?
        <div style={{ marginTop: '12px' }}>
          {received}
          {received && dust ? ' ' : null}
          {dust}
        </div>
      : null}
    </>
  );
}

/** Also the fallback for zap steps built without zapDetails */
const CrossChainZapSuccessContent = memo(function CrossChainZapSuccessContent({
  step,
}: SuccessContentProps) {
  const { t } = useTranslation();
  const returned = useAppSelector(selectZapReturned, tokenAmountsEqual);
  const srcReturned = useAppSelector(selectCrossChainSrcReturned, tokenAmountsEqual);
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
  const dstReceived = useAppSelector(selectCrossChainDstReceived, tokenAmountsEqual);
  const dstDust = useAppSelector(selectCrossChainDstDust, tokenAmountsEqual);

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
              'Stepper-Zap-Withdraw-Received'
            : 'Stepper-Zap-Deposit-Received'
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

      return <ZapSuccessMessage main={mainText} received={receivedLine} dust={dustLine} />;
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
