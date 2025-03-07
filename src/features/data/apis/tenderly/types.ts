export type TenderlySimulationsRequest = {
  page: number;
  perPage: number;
};

export type TenderlyBlockHeader = unknown;

export type TenderlyStateOverride = {
  storage?: {
    [key: string]: string;
  };
};

export type TenderlyAccessListEntry = {
  address: string;
};
export type TenderlyAccessList = TenderlyAccessListEntry[];

export type TenderlySimulation = {
  id: string;
  project_id: string;
  owner_id: string;
  network_id: string;
  block_number: number;
  transaction_index: number;
  from: string;
  to: string;
  input: string;
  gas: number;
  gas_price: string;
  gas_used: number;
  value: string;
  method: string;
  status: boolean;
  access_list: TenderlyAccessList;
  queue_origin: string;
  block_header: TenderlyBlockHeader;
  state_overrides: Record<string, TenderlyStateOverride>;
  created_at: string;
};

export type TenderlySimulationsResult = {
  simulations: TenderlySimulation[];
};

export type TenderlySimulateRequest = {
  network_id: string;
  from: string;
  to: string;
  input: string;
  value: string;
  save: boolean;
  save_if_fails: boolean;
  simulation_type: 'full' | 'quick' | 'abi';
  gas: number;
};

export type TenderlySimulateBundleRequest = {
  simulations: TenderlySimulateRequest[];
};

type DecodedValue = {
  value: unknown;
  soltype: {
    name: string;
    type: string;
  };
};

export type TenderlyCallTrace = {
  contract_name: string;
  function_name: string;
  call_type: string;
  from: string;
  to: string;
  error: string;
  error_op: string;
  error_reason?: string;
  calls: TenderlyCallTrace[] | null;
  input: string;
  decoded_input?: DecodedValue[];
  output?: string;
  decoded_output?: DecodedValue[];
  error_code_length?: number;
  error_code_start?: number;
  error_file_index?: number;
  function_code_length?: number;
  function_code_start?: number;
  function_file_index?: number;
};

type TenderlySimulateResponseTransaction = {
  hash: string;
  status: boolean;
  transaction_info: {
    error_message: string;
    call_trace: TenderlyCallTrace;
  };
};

type TenderlySimulateResponseSimulation = {
  id: string;
  project_id: string;
  owner_id: string;
  network_id: string;
  block_number: number;
  status: boolean;
  error_message: string;
  method: string;
  to: string;
};

export type TenderlySimulateResponseContract = {
  address: string;
  contract_name: string;
  standard: string;
  data?: {
    contract_info?: Array<{
      id: number;
      name: string;
      path: string;
      source: string;
    }>;
  };
};

export type TenderlySimulateResponse = {
  transaction: TenderlySimulateResponseTransaction;
  simulation: TenderlySimulateResponseSimulation;
  contracts: Array<TenderlySimulateResponseContract>;
  generated_access_list: TenderlyAccessList;
};

export type TenderlySimulateBundleResponse = {
  simulation_results: TenderlySimulateResponse[];
};
