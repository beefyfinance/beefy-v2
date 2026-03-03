export type MessageLifecycleState =
  | 'discovered'
  | 'awaiting_attestation'
  | 'attestation_received'
  | 'ready_to_relay'
  | 'pending_tx'
  | 'confirmed'
  | 'cancelled'
  | 'abandoned'
  | 'pending_attestation';

export type MessageListItem = {
  attestationNonce: string;
  attestationVersion: number;
  srcNetworkId: number;
  srcTxHash: string;
  srcLogIndex: number;
  srcBlockNumber: string;
  srcBlockTimestamp: string;
  srcSender: string;
  srcBurnToken: string;
  srcBurnAmount: string;
  dstNetworkId: number;
  dstRecipient: string;
  lifecycleState: MessageLifecycleState;
  dstTxHash: string;
  dstBlockNumber: string;
  dstBlockTimestamp: string;
  zapRecipient: string;
  zapPayload: {
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
};

export type MessageListResponse = {
  messages: MessageListItem[];
  cursor: string;
};
