import {
  getVaultRiskGroupRisks,
  getVaultRisks,
  VaultRisk,
  VaultRiskGroup,
  VaultRiskId,
} from '../../../lib/config/risk';
import { groupBy, keyBy } from 'lodash';
import { checkbox, confirm, Separator } from '@inquirer/prompts';
import { safetyScoreNum } from '../../../../../src/helpers/safetyScore';
import { MAX_SCORE } from '../../../../../src/config/risk';
import { createFactory } from '../../../utils/factory';
import { isDefined } from '../../../utils/typeguards';
import { pConsole, theme } from '../../../utils/console';
import { envBoolean } from '../../../utils/env';

export type ProceedMsgFn = (score: number | undefined, max: number) => string;

const defaultProceedMsgFn: ProceedMsgFn = (score, max) => {
  const scoreString = score == undefined ? '0' : score.toFixed(2);
  const maxString = max.toFixed(2);
  return `Safety score is ${scoreString}/${maxString}, proceed?`;
};

function score(risk: VaultRisk) {
  return (-risk.score * risk.category.score * MAX_SCORE).toFixed(2);
}

export const createVaultRisksPrompt = createFactory(async (requiredRisks: VaultRiskId[] = []) => {
  const vaultRisks = await getVaultRisks();
  const risksByCategory = groupBy(vaultRisks, r => r.category.id);
  const riskById = keyBy(vaultRisks, r => r.id);
  const isVaultRiskId = (id: string): id is VaultRiskId => isDefined(riskById[id]);
  const validateRiskSelection = (input: VaultRiskId[]): string | true => {
    if (input.length === 0) {
      return 'Please select at least one risk';
    }
    const inputRisks = input.map(id => riskById[id]);
    const riskGroupCounts = inputRisks.reduce((acc, risk) => {
      if (risk.group) {
        acc.set(risk.group, (acc.get(risk.group) || 0) + 1);
      }
      return acc;
    }, new Map<VaultRiskGroup, number>());
    for (const riskGroup of riskGroupCounts) {
      if (riskGroup[1] > 1) {
        const risksInGroup = getVaultRiskGroupRisks(riskGroup[0]).join(' | ');
        return `Only one of ${risksInGroup} can be selected`;
      }
    }

    const missingRequiredRisks = requiredRisks.filter(id => !input.includes(id));
    if (missingRequiredRisks.length) {
      return `Risks ${missingRequiredRisks.join(', ')} are required`;
    }

    const score = safetyScoreNum(input);
    if (score === undefined || score === 0) {
      return `A score of 0 is not allowed`;
    }

    return true;
  };
  const confirmSelection = async (riskIds: VaultRiskId[], proceedMsgFn: ProceedMsgFn) => {
    const score = safetyScoreNum(riskIds);
    const max = MAX_SCORE;
    return confirm({
      message: proceedMsgFn(score, max),
      default: true,
    });
  };
  const selectMessage = 'Select vault risks';

  return async (defaultSelected: string[] = [], proceedMsgFn?: ProceedMsgFn) => {
    proceedMsgFn ??= defaultProceedMsgFn;

    const initialSelection = defaultSelected.filter(isVaultRiskId);
    const validInitialSelection = validateRiskSelection(initialSelection);
    if (
      initialSelection.length &&
      initialSelection.length === defaultSelected.length &&
      validInitialSelection === true
    ) {
      if (envBoolean('CLI_CLM_TEST', false)) {
        return initialSelection;
      }

      pConsole.question(
        selectMessage,
        initialSelection
          .map(id => riskById[id])
          .map(risk => `${risk.id} (${theme.bold(score(risk))})`)
          .join(', ')
      );
      const confirmed = await confirmSelection(initialSelection, proceedMsgFn);
      if (confirmed) {
        return initialSelection;
      }
    } else if (envBoolean('CLI_CLM_TEST', false)) {
      throw new Error(`CLI_CLM_TEST: Invalid risks provided, not prompting`);
    }

    const selected = new Set<VaultRiskId>(initialSelection);
    requiredRisks.forEach(id => selected.add(id));

    while (true) {
      const riskIds = await checkbox<VaultRiskId>({
        message: selectMessage,
        choices: Object.entries(risksByCategory).flatMap(([category, risks]) => [
          new Separator(`--- ${risks[0].category.title} ---`),
          ...risks.map(risk => ({
            name: `${risk.id} (${theme.bold(score(risk))}) - ${theme.description(risk.title)}`,
            value: risk.id,
            description: risk.title,
            short: `${risk.id} (${theme.bold(score(risk))})`,
            checked: selected.has(risk.id),
          })),
        ]),
        required: true,
        validate: input => {
          return validateRiskSelection(input.map(choice => choice.value));
        },
      });

      selected.clear();
      riskIds.forEach(id => selected.add(id));

      if (selected.size > 0) {
        const riskIds = Array.from(selected);
        const confirmed = await confirmSelection(riskIds, proceedMsgFn);
        if (confirmed) {
          return riskIds;
        }
      }
    }
  };
});
