import { type ExitPoolUserData, type JoinPoolUserData } from './types';
import { type Hex } from 'viem';
export declare class JoinExitEncoder {
    private constructor();
    static encodeJoin(join: JoinPoolUserData): Hex;
    static encodeExit(exit: ExitPoolUserData): Hex;
}
