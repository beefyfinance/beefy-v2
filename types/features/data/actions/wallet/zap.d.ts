import type { UserlessZapRequest } from '../../apis/transact/zap/types';
import type { TokenEntity } from '../../entities/token';
import { type VaultEntity } from '../../entities/vault';
export declare const zapExecuteOrder: (vaultId: VaultEntity["id"], params: UserlessZapRequest, expectedTokens: TokenEntity[]) => import("../../store/types").BeefyThunk;
