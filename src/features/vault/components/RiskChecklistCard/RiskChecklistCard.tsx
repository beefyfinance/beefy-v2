import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { Card } from '../Card/Card.tsx';
import { CardContent } from '../Card/CardContent.tsx';
import { CardHeader } from '../Card/CardHeader.tsx';
import { selectVaultRiskChecklist } from '../../../data/selectors/risks.ts';
import { format, fromUnixTime } from 'date-fns';
import { CardTitle } from '../Card/CardTitle.tsx';
import { Banner } from '../../../../components/Banners/Banner/Banner.tsx';
import { styled } from '@repo/styles/jsx';
import { RiskList } from './RiskList.tsx';
import { Other } from './Other.tsx';

type RiskChecklistProps = {
  vaultId: VaultEntity['id'];
};

function RiskChecklist({ vaultId }: RiskChecklistProps) {
  const { t } = useTranslation();
  const checklist = useAppSelector(state => selectVaultRiskChecklist(state, vaultId));
  const lastUpdated = useMemo(
    () => format(fromUnixTime(checklist.updatedAt), 'MMM d, yyyy'),
    [checklist.updatedAt]
  );
  const passed =
    checklist.passed.length ? <RiskList risks={checklist.passed} mode="passed" /> : undefined;
  const failed =
    checklist.failed.length ? <RiskList risks={checklist.failed} mode="failed" /> : undefined;
  const passedInCollapse = !!passed && !!failed;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <Banner text={t('Checklist-Introduction', { ns: 'risks' })} variant="info" />
        <LastUpdated>Last Update: {lastUpdated}</LastUpdated>
        <Results>
          {failed}
          {passedInCollapse ?
            <Other title="Other checks">{passed}</Other>
          : passed}
        </Results>
      </CardContent>
    </Card>
  );
}

const LastUpdated = styled('div', {
  base: {
    textStyle: 'body.md',
    color: 'text.dark',
    marginTop: '20px',
  },
});

const Results = styled('div', {
  base: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
});

export const RiskChecklistCard = memo(RiskChecklist);
