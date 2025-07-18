import { styled } from '@repo/styles/jsx';
import BigNumber from 'bignumber.js';
import { memo, type ReactNode, useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/Button/Button.tsx';
import { TokenAmount } from '../../../components/TokenAmount/TokenAmount.tsx';
import { TokenImageFromEntity } from '../../../components/TokenImage/TokenImage.tsx';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { useAppDispatch, useAppSelector } from '../../data/store/hooks.ts';
import { stepperStartWithSteps } from '../../data/actions/wallet/stepper.ts';
import { redeemGems } from '../../data/actions/wallet/begems.ts';
import type { TokenEntity } from '../../data/entities/token.ts';
import { selectUserBalanceOfToken } from '../../data/selectors/balance.ts';
import {
  selectBeGemsSeason,
  selectBeGemsTokenSeasonData,
} from '../../data/selectors/campaigns/begems.ts';
import {
  selectTokenByAddress,
  selectTokenByAddressOrUndefined,
  selectTokenById,
  selectTokenPriceByTokenOracleId,
} from '../../data/selectors/tokens.ts';
import { ActionConnectSwitch } from '../../vault/components/Actions/Boosts/ActionConnectSwitch.tsx';
import {
  AmountInput,
  type AmountInputProps,
} from '../../vault/components/Actions/Transact/AmountInput/AmountInput.tsx';
import { AmountInputWithSlider } from '../../vault/components/Actions/Transact/AmountInputWithSlider/AmountInputWithSlider.tsx';
import { getUnixNow } from '../../../helpers/date.ts';
import type { SeasonBoxProps } from './types.ts';

const SeasonTokenRedeem = memo(function SeasonTokenRedeem({ season }: SeasonBoxProps) {
  const data = useAppSelector(state => selectBeGemsTokenSeasonData(state, season));

  if (data.token && data.priceForFullShare?.gt(BIG_ZERO)) {
    return (
      <RedeemFormEnabled
        season={season}
        tokenAddress={data.token}
        priceForFullShare={data.priceForFullShare}
      />
    );
  }

  return <RedeemFormDisabled season={season} tokenAddress={data.token} />;
});

type RedeemFormEnabledProps = {
  season: number;
  tokenAddress: string;
  priceForFullShare: BigNumber;
};

const RedeemFormEnabled = memo(function RedeemFormEnabled({
  season,
  tokenAddress,
  priceForFullShare,
}: RedeemFormEnabledProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const inputToken = useAppSelector(state => selectTokenByAddress(state, 'sonic', tokenAddress));
  const balance = useAppSelector(state => selectUserBalanceOfToken(state, 'sonic', tokenAddress));
  const [inputAmount, setInputAmount] = useState<BigNumber>(BIG_ZERO);
  const setMax = useCallback(() => {
    setInputAmount(balance);
  }, [setInputAmount, balance]);
  const deferredInputAmount = useDeferredValue(inputAmount);
  const outputAmount = useMemo(
    () =>
      deferredInputAmount.multipliedBy(priceForFullShare).decimalPlaces(18, BigNumber.ROUND_FLOOR),
    [deferredInputAmount, priceForFullShare]
  );
  const handleRedeem = useCallback(() => {
    dispatch(
      stepperStartWithSteps(
        [
          {
            step: 'redeem',
            message: t('Vault-TxnConfirm', { type: 'Redeem' }),
            action: redeemGems(season, inputAmount),
            pending: false,
          },
        ],
        'sonic'
      )
    );
  }, [dispatch, t, inputAmount, season]);

  return (
    <RedeemForm
      available={<AmountAvailable balance={balance} onClick={setMax} />}
      input={
        <AmountInputWithSlider
          value={deferredInputAmount}
          maxValue={balance}
          tokenDecimals={18}
          onChange={setInputAmount}
          endAdornment={<TokenAdornment token={inputToken} />}
        />
      }
      output={<OutputAmount amount={outputAmount} />}
      onSubmit={handleRedeem}
    />
  );
});

type RedeemFormDisabledProps = {
  season: number;
  tokenAddress?: string | undefined;
};

const RedeemFormDisabled = memo(function RedeemFormDisabled({
  season,
  tokenAddress,
}: RedeemFormDisabledProps) {
  const config = useAppSelector(state => selectBeGemsSeason(state, season));
  const inputToken = useAppSelector(state =>
    tokenAddress ? selectTokenByAddressOrUndefined(state, 'sonic', tokenAddress) : undefined
  );
  const text = useMemo(() => {
    const now = getUnixNow();
    if (now > config.endTime) {
      return 'Redeem soon';
    }
    // const date = fromUnixTime(config.endTime);
    // return `Redeem in ${format(date, 'MMMM')}`;
    return undefined;
  }, [config]);

  return (
    <RedeemForm
      corner={text && <Banner>{text}</Banner>}
      input={
        inputToken && (
          <AmountInputWithSlider
            value={BIG_ZERO}
            maxValue={BIG_ZERO}
            disabled={true}
            tokenDecimals={18}
            endAdornment={<TokenAdornment token={inputToken} />}
          />
        )
      }
    />
  );
});

const Corner = styled('div', {
  base: {
    position: 'absolute',
    top: '0',
    right: '0',
    overflow: 'hidden',
    pointerEvents: 'none',
    height: '100%',
    zIndex: '[1]',
  },
});

const Banner = styled('div', {
  base: {
    background: '{gradients.boost}',
    color: 'darkBlue.70',
    padding: '6px 100px',
    borderRadius: '0 0 0 16px',
    textStyle: 'subline.sm.semiBold',
    transformOrigin: 'center center',
    transform: 'rotate(30deg) translate(25%, -25%)',
    boxShadow:
      '0px 27px 40px 0px rgba(0, 0, 0, 0.40), 0px 8.14px 12.059px 0px rgba(0, 0, 0, 0.26), 0px 3.381px 5.009px 0px rgba(0, 0, 0, 0.20), 0px 1.223px 1.812px 0px rgba(0, 0, 0, 0.14)',
    md: {
      textStyle: 'subline.semiBold',
    },
  },
});

type RedeemFormProps = {
  available?: ReactNode;
  input?: ReactNode;
  output?: ReactNode;
  corner?: ReactNode;
  onSubmit?: () => void;
};

const RedeemForm = memo(function RedeemForm({
  available,
  input,
  output,
  corner,
  onSubmit,
}: RedeemFormProps) {
  return (
    <FormBackground>
      {corner && <Corner>{corner}</Corner>}
      <FormLayout disabled={!available || !input || !output || !onSubmit}>
        <Controls>
          <ControlWithLabel>
            <ControlLabel>
              <Label>You redeem</Label>
              <SubLabel>{available || <AmountAvailable balance={BIG_ZERO} />}</SubLabel>
            </ControlLabel>
            <div>
              {input || (
                <AmountInputWithSlider
                  value={BIG_ZERO}
                  maxValue={BIG_ZERO}
                  disabled={true}
                  tokenDecimals={18}
                />
              )}
            </div>
          </ControlWithLabel>
          <ControlWithLabel>
            <ControlLabel>
              <Label>You get</Label>
            </ControlLabel>
            <div>{output || <OutputAmount amount={BIG_ZERO} />}</div>
          </ControlWithLabel>
        </Controls>
        <ActionConnectSwitch chainId={'sonic'}>
          <Button
            variant="success"
            fullWidth={true}
            borderless={true}
            onClick={onSubmit}
            disabled={!onSubmit}
          >
            Redeem
          </Button>
        </ActionConnectSwitch>
      </FormLayout>
    </FormBackground>
  );
});

type AmountAvailableProps = {
  balance: BigNumber;
  onClick?: () => void;
};

const AmountAvailable = memo(function AmountAvailable({ balance, onClick }: AmountAvailableProps) {
  return (
    <AvailableButton onClick={onClick}>
      <span>{'Available:'}</span>
      <Amount>
        <TokenAmount amount={balance} decimals={18} />
      </Amount>
    </AvailableButton>
  );
});

type OutputAmountProps = {
  amount: BigNumber;
} & Omit<AmountInputProps, 'value' | 'maxValue' | 'price' | 'disabled'>;

const OutputAmount = memo(function OutputAmount({ amount, ...rest }: OutputAmountProps) {
  const token = useAppSelector(state => selectTokenById(state, 'sonic', 'S'));
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, token.oracleId));

  return (
    <AmountInput
      value={amount}
      maxValue={amount}
      price={price}
      disabled={true}
      endAdornment={<TokenAdornment token={token} />}
      {...rest}
    />
  );
});

type TokenAdornmentProps = {
  token: TokenEntity;
};

const TokenAdornment = memo(function TokenAdornment({ token }: TokenAdornmentProps) {
  return (
    <InputAdornment>
      <TokenImageFromEntity token={token} size={24} />
      {token.symbol}
    </InputAdornment>
  );
});

const InputAdornment = styled('div', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px 4px 4px',
    borderRadius: '16px 6px 6px 16px',
    background: 'darkBlue.80',
    whiteSpace: 'nowrap',
    color: 'text.middle',
  },
});

const AvailableButton = styled('button', {
  base: {
    display: 'inline-flex',
    gap: '4px',
  },
});

const Amount = styled('span', {
  base: {
    color: 'text.middle',
  },
});

const Label = styled('div', {
  base: {
    textStyle: 'body',
  },
});

const SubLabel = styled('div', {
  base: {
    textStyle: 'body.sm',
    marginLeft: 'auto',
  },
});

const ControlLabel = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'row',
    gap: '6px',
    color: 'text.dark',
  },
});

const ControlWithLabel = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
});

const Controls = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
});

const FormBackground = styled('div', {
  base: {
    width: '100%',
    padding: '36px 24px 32px 24px',
    sm: {
      position: 'relative',
      borderRadius: '24px',
      background: 'darkBlue.70',
    },
  },
});

const FormLayout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  variants: {
    disabled: {
      true: {
        pointerEvents: 'none',
        opacity: 0.5,
        userSelect: 'none',
      },
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default SeasonTokenRedeem;
