import { makeStyles } from '@material-ui/styles';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../components/Section';
import { ChainHolding } from './components/ChainHolding';
import { styles } from './styles';

const datas = [
  {
    chainId: 'bsc',
    totalHoldings: 5000,
    assets: [
      { asset: 'bsc', value: 2500 },
      { asset: 'eth', value: 2500 },
    ],
    stackedAssets: [{ asset: 'bsc', value: 2500 }],
  },
  {
    chainId: 'polygon',
    totalHoldings: 5000,
    assets: [
      { asset: 'bsc', value: 2500 },
      { asset: 'eth', value: 2500 },
    ],
    lockedAssets: [
      { asset: 'eth', value: 2500 },
      { asset: 'eth', value: 2500 },
    ],
  },
  {
    chainId: 'arbitrum',
    totalHoldings: 7000,
    assets: [
      { asset: 'eth', value: 2500 },
      { asset: 'bifi', value: 2000 },
    ],
    stackedAssets: [{ asset: 'bsc', value: 2500 }],
  },
];

const useStyles = makeStyles(styles);

export const DaoHoldings = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Section title={t('Treasury-Title-Holdings')}>
      <div className={classes.container}>
        {datas.map(data => (
          <ChainHolding key={data.chainId} data={data} />
        ))}
      </div>
    </Section>
  );
});
