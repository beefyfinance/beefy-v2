import type { Abi } from 'viem';

export const CircleBeefyZapReceiverAbi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'recipient',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'token',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'minOutputAmount',
                type: 'uint256',
              },
            ],
            internalType: 'struct IBeefyZapRouter.Output[]',
            name: 'outputs',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
            ],
            internalType: 'struct IBeefyZapRouter.Relay',
            name: 'relay',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'value',
                type: 'uint256',
              },
              {
                internalType: 'bytes',
                name: 'data',
                type: 'bytes',
              },
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'token',
                    type: 'address',
                  },
                  {
                    internalType: 'int32',
                    name: 'index',
                    type: 'int32',
                  },
                ],
                internalType: 'struct IBeefyZapRouter.StepToken[]',
                name: 'tokens',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct IBeefyZapRouter.Step[]',
            name: 'route',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct ICircleBeefyZapReceiver.ZapPayload',
        name: 'payload',
        type: 'tuple',
      },
    ],
    name: 'encodeZapPayload',
    outputs: [],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'message',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'attestation',
        type: 'bytes',
      },
    ],
    name: 'relay',
    outputs: [
      {
        internalType: 'bool',
        name: 'zapSuccess',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'zapSuccess',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'usdcRemaining',
        type: 'uint256',
      },
    ],
    name: 'ZapExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Refunded',
    type: 'event',
  },
] as const satisfies Abi;

/** ZapPayload ABI params for use with encodeAbiParameters */
export const ZapPayloadAbiParams = CircleBeefyZapReceiverAbi[0]['inputs'];
