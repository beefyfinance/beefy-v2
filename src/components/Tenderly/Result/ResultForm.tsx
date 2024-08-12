import type { ChainId } from '../../../features/data/entities/chain';
import type {
  TenderlySimulateRequest,
  TenderlySimulateResponse,
} from '../../../features/data/apis/tenderly/types';
import { Fragment, memo, useMemo } from 'react';
import { useAppSelector } from '../../../store';
import {
  selectTenderlyCredentialsOrUndefined,
  selectTenderlyResultOrUndefined,
} from '../../../features/data/selectors/tenderly';
import { AlertError } from '../../Alerts';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type {
  TenderlySimulateConfig,
  TenderlyTxCallRequest,
} from '../../../features/data/actions/tenderly';
import clsx from 'clsx';
import { ExternalLink } from '../Links/ExternalLink';
import type { StackEntry } from './StackEntry';
import { ExplorerAddressLink } from '../Links/ExplorerAddressLink';
import { TenderlySimulateResponseProcessor } from './TenderlySimulateResponseProcessor';
import { VerticalLayout } from '../Layout/VerticalLayout';
import { Scrollable } from '../../Scrollable';

const useStyles = makeStyles(styles);

type SimulationProps = {
  url?: string;
  index: number;
  chainId: ChainId;
  call: TenderlyTxCallRequest;
  config: TenderlySimulateConfig;
  request: TenderlySimulateRequest;
  response: TenderlySimulateResponse;
};

const SimulationSuccess = memo<SimulationProps>(function SimulationSuccess(_props) {
  return null;
});

type BytesDisplayProps = {
  value: string;
};

const BytesDisplay = memo<BytesDisplayProps>(function BytesDisplay({ value }) {
  const classes = useStyles();
  const lines = useMemo((): string[] => {
    const bytes = value.slice(0, 2) === '0x' ? value.slice(2) : value;
    const matches = bytes.match(/.{1,64}/g);
    if (!matches) {
      return [];
    }
    return matches;
  }, [value]);
  const length = lines.length.toString().length;

  return (
    <Scrollable className={classes.bytesDisplay} autoHeight={180}>
      <div className={classes.bytesDisplayInner}>
        {lines.map((line, i) => (
          <div
            key={i}
            data-line={i.toString().padStart(length, '0')}
            className={classes.bytesDisplayLine}
          >
            {line}
          </div>
        ))}
      </div>
    </Scrollable>
  );
});

type ObjectDisplayProps = {
  depth: number;
  input: Record<string, unknown>;
};

const ObjectDisplay = memo<ObjectDisplayProps>(function ObjectDisplay({ input, depth }) {
  return <PairDisplay input={Object.entries(input)} depth={depth} />;
});

type ArrayDisplayProps = {
  depth: number;
  input: Array<unknown>;
};

const ArrayDisplay = memo<ArrayDisplayProps>(function ArrayDisplay({ input, depth }) {
  return <PairDisplay input={input.map((value, key) => [key.toString(), value])} depth={depth} />;
});

type PairDisplayProps = {
  depth: number;
  input: Array<[string, unknown]>;
};

const PairDisplay = memo<PairDisplayProps>(function PairDisplay({ input, depth }) {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.pairDisplay, { [classes.pairDisplayOdd]: depth % 2 === 1 })}
      data-depth={depth}
    >
      {input.map(([key, value], i) => (
        <Fragment key={key || i}>
          <div className={classes.pairDisplayKey}>{key}</div>
          <div className={classes.pairDisplayValue}>
            <UnknownDisplay input={value} depth={depth + 1} />
          </div>
        </Fragment>
      ))}
    </div>
  );
});

type UnknownDisplayProps = {
  depth: number;
  input: unknown;
};

const UnknownDisplay = memo<UnknownDisplayProps>(function UnknownDisplay({ input, depth }) {
  if (input === null) {
    return 'null';
  }

  switch (typeof input) {
    case 'string':
    case 'boolean':
    case 'symbol':
    case 'number':
    case 'bigint':
      return input.toString();
    case 'undefined':
      return 'undefined';
    case 'function':
      return '[function]';
  }

  if (Array.isArray(input)) {
    return <ArrayDisplay input={input as Array<unknown>} depth={depth} />;
  }

  try {
    const keys = Object.keys(input);
    if (keys.length) {
      return <ObjectDisplay input={input as Record<string, unknown>} depth={depth} />;
    }

    return JSON.stringify(input);
  } catch {
    // nothing
  }

  return 'unknown';
});

type ParamsDisplayProps = {
  input: Record<string, unknown>;
};

const ParamsDisplay = memo<ParamsDisplayProps>(function ParamsDisplay({ input }) {
  const classes = useStyles();

  return (
    <Scrollable className={classes.paramsDisplay} autoHeight={300}>
      <ObjectDisplay input={input} depth={0} />
    </Scrollable>
  );
});

type StackProps = {
  stack: StackEntry;
  chainId: ChainId;
  baseUrl?: string;
};

const Stack = memo<StackProps>(function Stack({ chainId, stack, baseUrl }) {
  const classes = useStyles();
  const { type, typeLabel, call, errorSource } = useMemo(() => {
    const { type, label } = stack.getType();
    const call = stack.getDetails();
    const errorSource = stack.isRevert ? stack.getErrorSource() : null;

    return { type, typeLabel: label, call, errorSource };
  }, [stack]);
  const hasInput = !!call.input || !!call.inputLabels;
  const hasOutput = !!call.output || !!call.outputLabels;

  return (
    <div
      className={clsx(classes.stack, {
        [classes.stackRevert]: type === 'revert',
        [classes.stackCall]: type === 'call',
        [classes.stackCallDelegate]: type === 'delegatecall',
        [classes.stackJumpDest]: type === 'jumpdest',
        [classes.stackUnknown]: type === 'unknown',
      })}
    >
      {baseUrl ? (
        <ExternalLink href={`${baseUrl}/debugger?trace=${stack.id}`} className={classes.stackTag}>
          {typeLabel}
        </ExternalLink>
      ) : (
        <div className={classes.stackTag}>{typeLabel}</div>
      )}
      <div className={classes.stackDetails}>
        <div className={classes.stackToFunc}>
          <div className={classes.stackTo}>
            <ExplorerAddressLink address={call.to} chainId={chainId}>
              {call.toLabel ? call.toLabel : call.to}
            </ExplorerAddressLink>
          </div>
          <div className={classes.stackFuncAccessor}>{'.'}</div>
          <div className={classes.stackFunc}>
            {call.funcLabel && call.func ? (
              <abbr title={call.func}>{call.funcLabel}</abbr>
            ) : (
              call.funcLabel ?? call.func
            )}
          </div>
          <div className={classes.stackFuncParamsOpen}>{'('}</div>
          {hasInput ? null : <div className={classes.stackFuncParamsClose}>{')'}</div>}
        </div>
        {hasInput ? (
          <div className={classes.stackInput}>
            {call.inputLabels ? (
              <ParamsDisplay input={call.inputLabels} />
            ) : call.input ? (
              <BytesDisplay value={call.input} />
            ) : null}
            <div className={classes.stackFuncParamsClose}>{')'}</div>
          </div>
        ) : null}
        {hasOutput ? (
          <div className={classes.stackOutput}>
            <div className={classes.stackFuncOutput}>{'→'}</div>
            {call.outputLabels ? (
              <ParamsDisplay input={call.outputLabels} />
            ) : call.output ? (
              <BytesDisplay value={call.output} />
            ) : null}
          </div>
        ) : null}
        {errorSource ? (
          <div className={classes.stackSource}>
            {errorSource.prev}
            <strong>{errorSource.source}</strong>
            {errorSource.next}
          </div>
        ) : null}
      </div>
    </div>
  );
});

type RevertProps = { baseUrl?: string; chainId: ChainId; error: string; stack: StackEntry[] };

const Revert = memo<RevertProps>(function Revert({ baseUrl, chainId, error, stack }) {
  const classes = useStyles();

  return (
    <div className={classes.revert}>
      <div className={classes.revertReason}>
        <AlertError>{error}</AlertError>
      </div>
      <div className={classes.revertStack}>
        {stack.map((stack, i) => (
          <Stack baseUrl={baseUrl} stack={stack} chainId={chainId} key={i} />
        ))}
      </div>
    </div>
  );
});

const SimulationRevert = memo<SimulationProps>(function SimulationRevert({
  url,
  chainId,
  response,
}) {
  const classes = useStyles();
  const { reverts } = useMemo(() => {
    const processor = new TenderlySimulateResponseProcessor(response);
    return {
      reverts: processor.getReverts(),
    };
  }, [response]);

  if (!reverts) {
    return 'Execution Reverted';
  }

  return (
    <div className={classes.reverts}>
      {reverts.map((revert, i) => (
        <Revert key={i} baseUrl={url} chainId={chainId} error={revert.error} stack={revert.stack} />
      ))}
    </div>
  );
});

type TransactionDetailsProps = {
  baseUrl: string;
  index: number;
  chainId: ChainId;
  call: TenderlyTxCallRequest;
  config: TenderlySimulateConfig;
  request: TenderlySimulateRequest;
  response: TenderlySimulateResponse;
};

const TransactionDetails = memo<TransactionDetailsProps>(function TransactionDetails({
  baseUrl,
  ...props
}) {
  const { request, response } = props;
  const didSave = request.save || (request.save_if_fails && !response.simulation.status);
  const url = didSave ? `${baseUrl}/${response.simulation.id}` : undefined;
  const Component = response.simulation.status ? SimulationSuccess : SimulationRevert;
  return <Component {...props} url={url} />;
});

type TransactionResultProps = {
  baseUrl: string;
  index: number;
  chainId: ChainId;
  call: TenderlyTxCallRequest;
  config: TenderlySimulateConfig;
  request: TenderlySimulateRequest;
  response?: TenderlySimulateResponse;
};
const TransactionResult = memo<TransactionResultProps>(function TransactionResult(props) {
  const { index, baseUrl, call, request, response } = props;
  const classes = useStyles();
  const didSave = response
    ? request.save || (request.save_if_fails && !response.simulation.status)
    : false;
  const url = didSave && response ? `${baseUrl}/${response.simulation.id}` : undefined;
  const status = response ? (response.simulation.status ? 'success' : 'revert') : 'missing';
  const statusText = status === 'missing' ? '-' : status.toUpperCase();

  return (
    <div
      className={clsx(classes.transaction, {
        [classes.transactionSuccess]: status === 'success',
        [classes.transactionRevert]: status === 'revert',
        [classes.transactionMissing]: status === 'missing',
      })}
    >
      <div className={classes.transactionHeader}>
        <div className={classes.transactionHeaderIndex}>{`#${index}`}</div>
        <div className={classes.transactionHeaderStep}>{call.step}</div>
        <div className={classes.transactionHeaderStatus}>
          {url ? (
            <ExternalLink href={url} icon>
              {statusText}
            </ExternalLink>
          ) : (
            statusText
          )}
        </div>
      </div>
      {status === 'missing' ? null : (
        <div className={classes.transactionDetails}>
          <TransactionDetails {...props} response={response!} />
        </div>
      )}
    </div>
  );
});

export const ResultForm = memo(function ResultForm() {
  const result = useAppSelector(selectTenderlyResultOrUndefined);
  const creds = useAppSelector(selectTenderlyCredentialsOrUndefined)!;
  const baseUrl = `https://dashboard.tenderly.co/${creds.account}/${creds.project}/simulator`;

  if (!result) {
    return <AlertError>Missing result</AlertError>;
  }

  return (
    <VerticalLayout>
      {result.calls.map((call, i) => (
        <TransactionResult
          key={i}
          index={i}
          chainId={result.chainId}
          baseUrl={baseUrl}
          call={call}
          config={result.config}
          request={result.requests[i]}
          response={result.responses[i]}
        />
      ))}
    </VerticalLayout>
  );
});
