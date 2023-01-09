import { BeefyZapConfig, OneInchZapConfig } from '../apis/config-types';

export type ZapEntityBeefy = BeefyZapConfig & { type: 'beefy' };
export type ZapEntityOneInch = OneInchZapConfig & { type: 'one-inch' };

export type ZapEntity = ZapEntityBeefy | ZapEntityOneInch;
