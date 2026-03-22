export type MessageLifecycleState =
  | 'discovered'
  | 'awaiting_attestation'
  | 'attestation_received'
  | 'ready_to_relay'
  | 'pending_tx'
  | 'confirmed'
  | 'zap_failed'
  | 'cancelled'
  | 'abandoned';

export type MessageListItem = {
  attestationNonce: string | null;
  attestationVersion: number | null;
  srcNetworkId: number;
  srcTxHash: string;
  srcLogIndex: number;
  srcBlockNumber: string;
  srcBlockTimestamp: string | null;
  srcSender: string | null;
  srcBurnToken: string | null;
  srcBurnAmount: string | null;
  dstNetworkId: number;
  dstRecipient: string | null;
  lifecycleState: MessageLifecycleState;
  dstTxHash: string | null;
  dstBlockNumber: string | null;
  dstBlockTimestamp: string | null;
  dstZapSuccess: boolean | null;
  dstAmountIn: string | null;
  dstRefundedAmount: string | null;
  dstRecoveredAmount: string | null;
  dstFeePaid: string | null;
  zapRecipient: string | null;
  zapPayload: Record<string, unknown> | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageDetail = MessageListItem & {
  srcBlockHash: string;
  dstCaller: string;
  dstRelayAttempts: number;
};

export type MessageListResponse = {
  messages: MessageListItem[];
  cursor: string | null;
};
