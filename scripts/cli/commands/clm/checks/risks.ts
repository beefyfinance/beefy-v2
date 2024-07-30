import { getVaultRisks, VaultRisk, VaultRiskId } from '../../../lib/config/risk';
import { isDefined } from '../../../utils/typeguards';
import { isEqual, mapValues, partition } from 'lodash';
import { VaultConfig } from '../../../../../src/features/data/apis/config-types';
import { IChecker, Source } from './types';
import { typedKeyBy } from '../../../utils/object';
import { createFactory } from '../../../utils/factory';
import { PromptChoice } from '../../../utils/prompt-types';
import { pConsole, theme } from '../../../utils/console';
import { promptTrim } from '../../../utils/prompt';
import { select } from '@inquirer/prompts';
import { MismatchedRisksResult, RiskSet } from './risk-types';
import { editVault } from '../../../lib/config/vault';
import { safetyScoreNum } from '../../../../../src/helpers/safetyScore';
import { MAX_SCORE } from '../../../../../src/config/risk';
import { createVaultRisksPrompt, ProceedMsgFn } from '../prompts/risks';

class RisksHelpers {
  private readonly riskIds: Set<string>;
  private readonly riskById: Record<VaultRiskId, VaultRisk>;
  private readonly groupRisksByRiskId: Record<VaultRiskId, VaultRisk[]>;

  constructor(protected readonly allRisks: VaultRisk[]) {
    this.riskIds = new Set(allRisks.map(risk => risk.id));
    this.riskById = typedKeyBy(allRisks, 'id');
    this.groupRisksByRiskId = mapValues(this.riskById, risk => {
      if (risk.group === undefined) {
        return [];
      }

      return this.allRisks.filter(
        otherRisk => otherRisk.id !== risk.id && otherRisk.group === risk.group
      );
    });
  }

  protected isRiskId = (id: string): id is VaultRiskId => this.riskIds.has(id);
  public toRisk = (id: VaultRiskId) => this.riskById[id];

  public getRisksSet(inputRisks: VaultConfig['risks']): RiskSet {
    const ids = (inputRisks || []).slice().sort();
    if (ids.length === 0) {
      return {
        valid: false,
        validIds: [],
        validRisks: [],
        allIds: [],
      };
    }

    const [existsYes, existsNo] = partition(ids, this.isRiskId);
    const existsSet = new Set(existsYes);
    const validRisks = existsYes.map(this.toRisk);

    if (existsNo.length) {
      return {
        valid: false,
        validIds: existsYes,
        validRisks,
        allIds: ids,
      };
    }

    const validSet = existsYes.every(id =>
      this.groupRisksByRiskId[id].every(risk => !existsSet.has(risk.id))
    );

    return {
      valid: validSet,
      validIds: existsYes,
      validRisks,
      allIds: ids,
    };
  }
}

const getRisksHelper = createFactory(async (vaultRisks?: VaultRisk[]) => {
  vaultRisks ??= await getVaultRisks();
  return new RisksHelpers(vaultRisks);
});

export class MismatchedRisks implements IChecker {
  public readonly type = 'mismatched-risks' as const;
  public readonly description = 'Mismatched risks between CLM and Pool/Vault';

  protected constructor() {}

  public static async create(): Promise<MismatchedRisks> {
    return new MismatchedRisks();
  }

  public async check(source: Source) {
    if (!source.pool && !source.vault) {
      return undefined;
    }

    const helper = await getRisksHelper();
    const clmRisks = helper.getRisksSet(source.clm.risks);
    const poolRisks = source.pool ? helper.getRisksSet(source.pool.risks) : undefined;
    const vaultRisks = source.vault ? helper.getRisksSet(source.vault.risks) : undefined;
    const allSame = [poolRisks, vaultRisks]
      .filter(isDefined)
      .every(risks => isEqual(clmRisks.allIds, risks.allIds));
    if (allSame) {
      return undefined;
    }

    const sets: MismatchedRisksResult['details']['sets'] = [{ source: 'clm', ...clmRisks }];
    if (poolRisks) {
      sets.push({ source: 'pool', ...poolRisks });
    }
    if (vaultRisks) {
      sets.push({ source: 'vault', ...vaultRisks });
    }

    return {
      type: 'mismatched-risks' as const,
      source,
      details: {
        clm: clmRisks,
        sets,
      },
    };
  }

  public async groupPrompt(results: MismatchedRisksResult[]): Promise<'back' | 'exit'> {
    // if CLM risks are valid and some other set is missing
    const autoMissingFilter = (s: MismatchedRisksResult['details']['sets'][number]) =>
      s.allIds.length === 0;
    const autoFixMissing = results.filter(
      r => r.details.clm.valid && r.details.sets.some(autoMissingFilter)
    );
    // if CLM risks are valid and some other set is invalid
    const autoInvalidFilter = (s: MismatchedRisksResult['details']['sets'][number]) =>
      s.allIds.length > 0 && !s.valid;
    const autoFixInvalid = results.filter(
      r => r.details.clm.valid && r.details.sets.some(autoInvalidFilter)
    );

    const choices: PromptChoice[] = [];
    const count = (arr: unknown[]) => `(${theme.bold(arr.length.toString())}/${results.length})`;
    const ids = (arr: MismatchedRisksResult[]) =>
      theme.description(`- ${arr.map(r => r.source.id).join(', ')}`);

    if (autoFixMissing.length) {
      choices.push({
        name: promptTrim(
          `${count(autoFixMissing)} Set Pool/Vaults with missing risks to match their CLM ${ids(
            autoFixMissing
          )}`
        ),
        short: 'Auto fix missing risks',
        value: '__auto_fix_missing',
      });
    }
    if (autoFixInvalid.length) {
      choices.push({
        name: promptTrim(
          `${count(autoFixInvalid)} Set Pool/Vaults with invalid risks to match their CLM - ${ids(
            autoFixInvalid
          )}`
        ),
        short: 'Auto fix invalid risks',
        value: '__auto_fix_invalid',
      });
    }
    choices.push(
      {
        name: promptTrim(`${count(results)} Manual ${theme.description('- Fix one by one')}`),
        value: '__manual',
      },
      {
        name: 'Back',
        value: '__back',
      },
      {
        name: 'Exit',
        value: '__exit',
      }
    );

    let state: 'ask' | 'manual' | 'auto-missing' | 'auto-invalid' | 'back' | 'exit' = 'ask';
    do {
      switch (state) {
        case 'ask': {
          const response = await select({
            message: 'Select an action',
            choices,
          });
          switch (response) {
            case '__auto_fix_missing':
              state = 'auto-missing';
              break;
            case '__auto_fix_invalid':
              state = 'auto-invalid';
              break;
            case '__manual':
              state = 'manual';
              break;
            case '__back':
              state = 'back';
              break;
            case '__exit':
              state = 'exit';
              break;
          }
          break;
        }
        case 'auto-missing': {
          await this.copyFromClm(autoFixMissing, autoMissingFilter);
          return 'exit';
        }
        case 'auto-invalid': {
          await this.copyFromClm(autoFixInvalid, autoInvalidFilter);
          return 'exit';
        }
        case 'manual': {
          await this.manualFixes(results);
          return 'exit';
        }
      }
    } while (state !== 'exit' && state !== 'back');

    return state;
  }

  protected async manualFixes(results: MismatchedRisksResult[]) {
    let n = 0;
    const count = results.length;
    for (const result of results) {
      ++n;
      pConsole.info(`${theme.bold(result.source.id)} - ${n} of ${count}`);
      pConsole.info(
        [
          `${theme.bold('Chain:')} ${result.source.clm.network}`,
          `${theme.bold('Provider:')} ${result.source.clm.tokenProviderId}`,
          `${theme.bold('Assets:')} ${(result.source.clm.assets || []).join(', ')}`,
        ].join(' | ')
      );
      const response = await this.resultPrompt(result);
      if (response === 'exit') {
        return;
      }
    }
  }

  protected async resultPrompt(result: MismatchedRisksResult) {
    let initialRisks: VaultRiskId[] = ['CONTRACTS_VERIFIED'];
    const validSets = result.details.sets.filter(s => s.validIds.length > 0);
    if (validSets.length > 0) {
      const response = await select({
        message: `Select risk set to copy from`,
        choices: [
          ...validSets.map(s => this.riskSetToChoice(result, s)),
          {
            name: 'Pick risks from list',
            value: '__manual',
          },
          {
            name: 'Exit',
            value: '__exit',
          },
        ] as PromptChoice<
          | MismatchedRisksResult['details']['sets'][number]['source']
          | '__manual'
          | '__back'
          | '__exit'
        >[],
      });
      switch (response) {
        case '__exit':
          return 'exit';
        case '__manual':
          break;
        case 'clm':
        case 'pool':
        case 'vault': {
          const set = result.details.sets.find(s => s.source === response);
          if (set) {
            initialRisks = set.validIds;
          }
          break;
        }
      }
    }

    const idsToEdit = [result.source.clm, result.source.pool, result.source.vault]
      .filter(isDefined)
      .map(c => c.id);
    const proceedMsgFn: ProceedMsgFn = (score, max) => {
      const scoreString = score == undefined ? '0' : score.toFixed(2);
      const maxString = max.toFixed(2);
      return `Safety score is ${scoreString}/${maxString}, save to ${idsToEdit.join(', ')}?`;
    };
    const riskPrompt = await createVaultRisksPrompt(['CONTRACTS_VERIFIED']);
    const risksToSet = await riskPrompt(initialRisks, proceedMsgFn);

    for (const idToEdit of idsToEdit) {
      await editVault(idToEdit, result.source.clm.network, (config: VaultConfig) => {
        return {
          ...config,
          risks: risksToSet,
        };
      });
      pConsole.success(`Saved risks for ${idToEdit}`);
    }
  }

  protected riskSetToChoice(
    result: MismatchedRisksResult,
    set: MismatchedRisksResult['details']['sets'][number]
  ) {
    const idsWithScores = this.risksToCommaList(set.validRisks);
    const score = this.risksToScore(set.validRisks);
    const config = result.source[set.source]!;

    return {
      name: promptTrim(
        `${set.source} ${theme.bold(`(${score})`)} ${theme.description(`- ${idsWithScores}`)}`
      ),
      description: `from ${set.source} ${config.id}${
        set.valid ? '' : `(${theme.errorPrefix()} invalid ${theme.errorPrefix()})`
      }`,
      value: set.source,
      short: `copy from from ${set.source} ${config.id}`,
    };
  }

  protected risksToCommaList(risks: VaultRisk[]) {
    return risks.map(r => `${r.id} (${r.score})`).join(', ');
  }

  protected risksToScore(risks: VaultRisk[]) {
    const score = safetyScoreNum(risks.map(r => r.id));
    if (!score) {
      return theme.errorPrefix();
    }

    return `${score.toFixed(2)}/${MAX_SCORE.toFixed(2)}`;
  }

  protected async copyFromClm(
    results: MismatchedRisksResult[],
    filter: (set: MismatchedRisksResult['details']['sets'][number]) => boolean
  ) {
    for (const result of results) {
      const toEdit = result.details.sets.filter(filter);
      for (const set of toEdit) {
        const editConfig = result.source[set.source];
        if (editConfig) {
          await editVault(editConfig.id, editConfig.network, (config: VaultConfig) => {
            return {
              ...config,
              risks: result.source.clm.risks,
            };
          });
          pConsole.success(`Saved risks for ${editConfig.id}`);
        }
      }
    }
  }
}
