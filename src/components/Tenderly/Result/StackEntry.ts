import type {
  TenderlyCallTrace,
  TenderlySimulateResponseContract,
} from '../../../features/data/apis/tenderly/types.ts';

export class StackEntry {
  constructor(
    public readonly id: string,
    protected trace: TenderlyCallTrace,
    protected contracts: Record<string, TenderlySimulateResponseContract>
  ) {}

  get errorReason(): string | undefined {
    return this.trace.error_reason;
  }

  protected getSourceFrom(
    contractAddress: string,
    code_length: number,
    code_start: number,
    file_index: number
  ) {
    const contract = this.contracts[contractAddress.toLowerCase()];
    if (!contract) {
      return undefined;
    }

    const file = contract.data?.contract_info?.[file_index];
    if (!file) {
      return undefined;
    }

    let prevCount = 0;
    let prevStart = code_start;
    do {
      const prevLineIndex = file.source.lastIndexOf('\n', prevStart - 1);
      if (prevLineIndex === -1) {
        break;
      }

      ++prevCount;
      prevStart = prevLineIndex;
    } while (prevCount < 10);

    let nextCount = 0;
    let nextStart = code_start + code_length;
    do {
      const nextLineIndex = file.source.indexOf('\n', nextStart + 1);
      if (nextLineIndex === -1) {
        break;
      }

      ++nextCount;
      nextStart = nextLineIndex;
    } while (nextCount < 10);

    return {
      prev:
        prevStart < code_start ?
          file.source.substring(prevStart, code_start).replace(/^\s*\n+/g, '')
        : '',
      source: file.source.substring(code_start, code_start + code_length),
      next:
        nextStart > code_start + code_length ?
          file.source.substring(code_start + code_length, nextStart).replace(/\n+\s*$/g, '')
        : '',
    };
  }

  getErrorSource() {
    const { error_code_length, error_code_start, error_file_index } = this.trace;
    if (
      !error_code_length ||
      error_code_start === undefined ||
      error_file_index === undefined ||
      error_code_start === null ||
      error_file_index === null
    ) {
      return undefined;
    }

    return this.getSourceFrom(
      this.trace.from,
      error_code_length,
      error_code_start,
      error_file_index
    );
  }

  get isRevert(): boolean {
    return this.trace.error_op === 'REVERT' && this.trace.calls === null;
  }

  getDetails() {
    const trace = this.trace;
    const { type, label: typeLabel } = this.getType();

    const to = trace.to;
    const toLabel = this.contracts[to.toLowerCase()]?.contract_name || undefined;

    const func = trace.input && trace.input.length >= 10 ? trace.input?.slice(0, 10) : undefined;
    const funcLabel = trace.function_name;

    const input = trace.input && trace.input.length > 10 ? trace.input?.slice(10) : undefined;
    const inputLabels =
      trace.decoded_input?.length ?
        Object.fromEntries(trace.decoded_input.map(d => [d.soltype.name, d.value]))
      : undefined;

    const output = trace.output && trace.output !== '0x' ? trace.output : undefined;
    const outputLabels =
      trace.decoded_output?.length ?
        Object.fromEntries(trace.decoded_output.map(d => [d.soltype.name, d.value]))
      : undefined;

    return {
      type,
      typeLabel,
      to,
      toLabel,
      func,
      funcLabel,
      input,
      inputLabels,
      output,
      outputLabels,
    };
  }

  getType(): StackEntryType {
    const trace = this.trace;

    if (trace.error_op === 'REVERT' && trace.calls === null) {
      return { type: 'revert', label: 'REVERT' };
    }

    const callType = trace.call_type.toLowerCase() || 'unknown';
    if (callType === 'call') {
      return { type: callType, label: 'S·CALL' };
    } else if (callType === 'delegatecall') {
      return { type: callType, label: 'D·CALL' };
    } else if (callType === 'jumpdest') {
      return { type: callType, label: 'JUMP' };
    }
    return { type: 'other', label: callType.toUpperCase() };
  }
}

type StackEntryType = {
  type: 'revert' | 'call' | 'delegatecall' | 'jumpdest' | 'unknown' | 'other';
  label: string;
};
