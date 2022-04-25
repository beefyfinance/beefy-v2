import { InfoCardsConfig } from '../features/data/apis/config-types';

export const infoCards: InfoCardsConfig = [
  {
    id: 'binspirit-voting',
    title: 'InfoCard-binSPIRIT-Title',
    vaultIds: ['beefy-binspirit', 'spirit-binspirit-spirit'],
    actions: [
      {
        type: 'link',
        text: 'Vote',
        url: 'https://snapshot.org/#/binspirit.eth',
      },
      {
        type: 'link',
        text: 'Discuss',
        url: 'https://discord.com/channels/755231190134554696/959457948545990786',
      },
    ],
    content: [
      {
        heading: 'InfoCard-binSPIRIT-Work-Title',
        text: 'InfoCard-binSPIRIT-Work-Text',
      },
      {
        heading: 'InfoCard-binSPIRIT-Bribes-Title',
        text: 'InfoCard-binSPIRIT-Bribes-Text',
      },
    ],
  },
];
