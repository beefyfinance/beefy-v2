import { makeWalletConnectWallet } from './walletConnectWallet.ts';

// wc app id: 5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489
// https://console.fireblocks.io/v2/wc?uri={WC_URI}
// fireblocks-wc://{WC_URI}
/*
  {
      "id": "5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489",
      "name": "Fireblocks",
      "homepage": "https://www.fireblocks.com/",
      "image_id": "7e1514ba-932d-415d-1bdb-bccb6c2cbc00",
      "order": 80,
      "mobile_link": "fireblocks-wc://",
      "desktop_link": null,
      "link_mode": null,
      "webapp_link": "https://console.fireblocks.io/v2/",
      "rdns_web_wallet": null,
      "app_store": "https://apps.apple.com/us/app/fireblocks/id1439296596",
      "play_store": "https://play.google.com/store/apps/details?id=com.fireblocks.client&gl=IL",
      "rdns": null,
      "chrome_store": null,
      "injected": null,
      "chains": [
        "cosmos:columbus-4",
        "eip155:1",
        "eip155:10",
        "eip155:10000",
        "eip155:10001",
        "eip155:1284",
        "eip155:1285",
        "eip155:137",
        "eip155:19",
        "eip155:250",
        "eip155:3",
        "eip155:30",
        "eip155:31",
        "eip155:4",
        "eip155:42",
        "eip155:42161",
        "eip155:421611",
        "eip155:42220",
        "eip155:43113",
        "eip155:43114",
        "eip155:44787",
        "eip155:5",
        "eip155:50",
        "eip155:51",
        "eip155:56",
        "eip155:59",
        "eip155:61",
        "eip155:62320",
        "eip155:63",
        "eip155:69",
        "eip155:97",
        "polkadot:91b171bb158e2d3848fa23a9f1c25182",
        "polkadot:b0a8d493285c2df73290dfb7e61f870f",
        "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
        "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
        "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
        "sui:mainnet"
      ],
      "categories": [
        "1778cd7f-a539-49fd-9de1-52d9c2101921",
        "e127a2ef-09e5-417b-9304-3e2e567a0f87"
      ],
      "description": "#1 Crypto and Digital Asset Platform for Institutions",
      "badge_type": "certified",
      "supports_wc": true,
      "is_top_wallet": false
    },
 */
export const fireblocksWallet = makeWalletConnectWallet({
  id: 'fireblocks',
  name: 'Fireblocks',
  iconUrl: async () => (await import('../../../../../images/wallets/fireblocks.svg')).default,
  // iconBackground: '#1c1c1b'
});
