import { formatPercent } from '../../../../../../helpers/format.ts';
import type { OptionFeeCampaign } from '../../../../../data/apis/transact/transact-types.ts';

export function campaignTag(campaign: OptionFeeCampaign | undefined): string | undefined {
  if (!campaign) {
    return undefined;
  }
  return campaign.effectiveBps === 0 ?
      'Free zap'
    : `Zap fee ${formatPercent(campaign.effectiveBps / 10000, 2)}`;
}
